// controllers/nutritionController.js — Nutrition analysis & logging
import axios   from 'axios';
import NutritionLog from '../models/NutritionLog.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ── POST /api/nutrition/analyze ───────────────────────────────
// Send ingredients to ML service → get nutrition breakdown
export const analyzeNutrition = async (req, res, next) => {
  try {
    const { ingredients, servings = 1 } = req.body;
    if (!ingredients || !ingredients.length) {
      return res.status(400).json({ success: false, message: 'Ingredients required' });
    }

    const mlResponse = await axios.post(`${ML_URL}/nutrition`, { ingredients, servings });
    res.json({ success: true, nutrition: mlResponse.data });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' });
    }
    next(err);
  }
};

// ── POST /api/nutrition/log ───────────────────────────────────
export const logMeal = async (req, res, next) => {
  try {
    const { date, recipeName, recipeId, mealType, servings, nutrition } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    // Find or create today's log
    let log = await NutritionLog.findOne({ user: req.user._id, date: logDate });
    if (!log) {
      log = new NutritionLog({ user: req.user._id, date: logDate, meals: [] });
    }

    log.meals.push({ recipeId, recipeName, mealType, servings, nutrition });
    await log.save(); // pre-save hook recalculates totals

    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error(err);
    
  }
};

// ── GET /api/nutrition/logs ───────────────────────────────────
// Returns logs for a date range (default: last 7 days)
export const getLogs = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const endDate   = to   || new Date().toISOString().split('T')[0];
    const startDate = from || (() => {
      const d = new Date(); d.setDate(d.getDate() - 6);
      return d.toISOString().split('T')[0];
    })();

    const logs = await NutritionLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/nutrition/summary ────────────────────────────────
export const getSummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log   = await NutritionLog.findOne({ user: req.user._id, date: today });

    const calorieGoal = req.user.preferences?.calorieGoal || 2000;
    const totals = log ? log.totals : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    res.json({
      success: true,
      date: today,
      totals,
      calorieGoal,
      calorieRemaining: Math.max(0, calorieGoal - totals.calories),
      mealsLogged: log ? log.meals.length : 0,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/nutrition/log/:logId/meal/:mealIdx ────────────
export const removeMeal = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOne({ _id: req.params.logId, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    log.meals.splice(Number(req.params.mealIdx), 1);
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    next(err);
  }
};
