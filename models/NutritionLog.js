// models/NutritionLog.js — Daily nutrition tracking
import mongoose  from 'mongoose';

const MealEntrySchema = new mongoose.Schema(
  {
    recipeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    recipeName: { type: String, required: true },
    servings:   { type: Number, default: 1 },
    mealType:   { type: String, enum: ['breakfast','lunch','dinner','snack'], default: 'lunch' },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein:  { type: Number, default: 0 },
      carbs:    { type: Number, default: 0 },
      fat:      { type: Number, default: 0 },
      fiber:    { type: Number, default: 0 },
    },
    loggedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NutritionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    meals: [MealEntrySchema],
    totals: {
      calories: { type: Number, default: 0 },
      protein:  { type: Number, default: 0 },
      carbs:    { type: Number, default: 0 },
      fat:      { type: Number, default: 0 },
      fiber:    { type: Number, default: 0 },
    },
    waterIntake: { type: Number, default: 0 }, // ml
    notes:       { type: String, default: '' },
  },
  { timestamps: true }
);

// One log per user per day
NutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Auto-calculate totals before save
NutritionLogSchema.pre('save', function (next) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  this.meals.forEach((m) => {
    Object.keys(totals).forEach((k) => {
      totals[k] += (m.nutrition[k] || 0) * m.servings;
    });
  });
  this.totals = totals;
  next();
});


const NutritionLog = mongoose.model("NutritionLog", NutritionLogSchema);

export default NutritionLog;

