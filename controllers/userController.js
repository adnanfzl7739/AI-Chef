// controllers/userController.js — User profile & preferences
import User   from '../models/User.js';
import Recipe from '../models/Recipe.js';

// ── GET /api/user/profile ─────────────────────────────────────
export const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/user/profile ─────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/user/preferences ─────────────────────────────────
export const updatePreferences = async (req, res, next) => {
  try {
    const { dietaryRestrictions, allergies, favoriteCuisines, calorieGoal, mealsPerDay } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'preferences.dietaryRestrictions': dietaryRestrictions,
        'preferences.allergies':           allergies,
        'preferences.favoriteCuisines':    favoriteCuisines,
        'preferences.calorieGoal':         calorieGoal,
        'preferences.mealsPerDay':         mealsPerDay,
      },
      { new: true, runValidators: true }
    );
    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/user/mealplan ────────────────────────────────────
export const updateMealPlan = async (req, res, next) => {
  try {
    const { weeklyMealPlan } = req.body; // { monday: [id1,id2], tuesday: [...] }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weeklyMealPlan },
      { new: true }
    );
    res.json({ success: true, weeklyMealPlan: user.weeklyMealPlan });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/user/mealplan ────────────────────────────────────
export const getMealPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const plan = user.weeklyMealPlan;

    // Populate recipe details for each day
    const populated = {};
    for (const [day, ids] of plan.entries()) {
      if (ids && ids.length) {
        populated[day] = await Recipe.find({ _id: { $in: ids } }).select('name cuisine nutrition prepTime cookTime');
      } else {
        populated[day] = [];
      }
    }

    res.json({ success: true, weeklyMealPlan: populated });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/user/password ────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
