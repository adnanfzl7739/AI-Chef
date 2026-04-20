// routes/user.js
import express from 'express'
import {
  getProfile, updateProfile, updatePreferences,
  updateMealPlan, getMealPlan, changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/profile',       getProfile);
router.put('/profile',       updateProfile);
router.put('/preferences',   updatePreferences);
router.get('/mealplan',      getMealPlan);
router.put('/mealplan',      updateMealPlan);
router.put('/password',      changePassword);

export default router;
