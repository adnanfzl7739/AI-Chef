// models/Recipe.js — Recipe schema
import mongoose from 'mongoose';

const NutritionSchema = new mongoose.Schema(
  {
    calories:  { type: Number, default: 0 },
    protein:   { type: Number, default: 0 }, // grams
    carbs:     { type: Number, default: 0 },
    fat:       { type: Number, default: 0 },
    fiber:     { type: Number, default: 0 },
    sugar:     { type: Number, default: 0 },
    sodium:    { type: Number, default: 0 },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, default: '' },
    cuisine: {
      type: String,
      enum: ['Indian','Italian','Mexican','Chinese','Japanese','Mediterranean',
             'American','French','Thai','Middle Eastern','Other'],
      default: 'Other',
    },
    ingredients: {
      type: [String],
      required: true,
    },
    instructions: {
      type: [String],
      required: true,
    },
    nutrition:     { type: NutritionSchema, default: () => ({}) },
    dietaryTags:   { type: [String], default: [] }, // vegan, keto, etc.
    prepTime:      { type: Number, default: 0 },    // minutes
    cookTime:      { type: Number, default: 0 },
    servings:      { type: Number, default: 4 },
    difficulty:    { type: String, enum: ['Easy','Medium','Hard'], default: 'Medium' },
    imageUrl:      { type: String, default: '' },
    // Who generated this recipe (null = system/ML)
    generatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAIGenerated: { type: Boolean, default: true },
    rating:        { type: Number, min: 0, max: 5, default: 0 },
    ratingCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index on name + ingredients
RecipeSchema.index({ name: 'text', ingredients: 'text' });

const Recipe = mongoose.model("Recipe", RecipeSchema);

export default Recipe;

