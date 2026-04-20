// controllers/recipeController.js — Recipe generation & management
import axios from 'axios';
import Recipe from '../models/Recipe.js';
import User   from '../models/User.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ── POST /api/recipes/generate ────────────────────────────────
// Calls ML microservice → saves & returns generated recipe
export const generateRecipe = async (req, res, next) => {
  try {
    const {
      ingredients = [],
      cuisine     = 'Any',
      dietary     = [],
      allergies   = [],
      servings    = 4,
    } = req.body;

    if (!ingredients.length) {
      return res.status(400).json({ success: false, message: 'Provide at least one ingredient' });
    }

    // ── Call ML microservice ──────────────────────────────────
    console.log('🔍 Calling ML at:', `${ML_URL}/generate`); 
    const mlResponse = await axios.post(`${ML_URL}/generate`, {
      ingredients,
      cuisine,
      dietary,
      allergies,
      servings,
    });

    const mlData = mlResponse.data;

    // ── Persist generated recipe ──────────────────────────────
    const recipe = await Recipe.create({
      name:         mlData.name,
      description:  mlData.description,
      cuisine:      mlData.cuisine || cuisine,
      ingredients:  mlData.ingredients,
      instructions: mlData.instructions,
      nutrition:    mlData.nutrition,
      dietaryTags:  mlData.dietary_tags || dietary,
      prepTime:     mlData.prep_time,
      cookTime:     mlData.cook_time,
      servings,
      difficulty:   mlData.difficulty,
      generatedBy:  req.user._id,
      isAIGenerated: true,
    });

    res.status(201).json({ success: true, recipe });
  } catch (err) {
    // If ML service is down return a graceful error
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'ML service unavailable. Please ensure the Python server is running on port 8000.',
      });
    }
    next(err);
  }
};

// ── GET /api/recipes/saved ────────────────────────────────────
export const getSavedRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedRecipes');
    res.json({ success: true, recipes: user.savedRecipes });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/recipes/save ────────────────────────────────────
export const saveRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedRecipes: recipeId },
    });

    res.json({ success: true, message: 'Recipe saved' });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/recipes/save/:id ──────────────────────────────
export const unsaveRecipe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedRecipes: req.params.id },
    });
    res.json({ success: true, message: 'Recipe removed from saved' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/recipes/recommendations ─────────────────────────
export const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { favoriteCuisines, dietaryRestrictions } = user.preferences;

    // Ask ML service for personalised recommendations
    let recommendations = [];
    try {
      const mlResponse = await axios.post(`${ML_URL}/recommend`, {
        saved_recipe_ids: user.savedRecipes.map(String),
        favorite_cuisines: favoriteCuisines,
        dietary: dietaryRestrictions,
      });
      recommendations = mlResponse.data.recommendations;
    } catch (_) {
      // Fallback: return random recipes matching preferences
      recommendations = await Recipe.find({
        cuisine: favoriteCuisines.length ? { $in: favoriteCuisines } : { $exists: true },
      })
        .limit(6)
        .sort({ rating: -1 });
    }

    res.json({ success: true, recommendations });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/recipes/:id ──────────────────────────────────────
export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/recipes/:id/rate ────────────────────────────────
export const rateRecipe = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    // Running average
    const newCount = recipe.ratingCount + 1;
    const newRating = ((recipe.rating * recipe.ratingCount) + rating) / newCount;
    recipe.rating      = Math.round(newRating * 10) / 10;
    recipe.ratingCount = newCount;
    await recipe.save();

    res.json({ success: true, rating: recipe.rating });
  } catch (err) {
    next(err);
  }
};
