// routes/recipes.js
import express from 'express'
import {
  generateRecipe, getSavedRecipes, saveRecipe, unsaveRecipe,
  getRecommendations, getRecipeById, rateRecipe,
} from '../controllers/recipeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.post('/generate',         generateRecipe);
router.get('/saved',             getSavedRecipes);
router.post('/save',             saveRecipe);
router.delete('/save/:id',       unsaveRecipe);
router.get('/recommendations',   getRecommendations);
router.get('/:id',               getRecipeById);
router.post('/:id/rate',         rateRecipe);

export default router;
