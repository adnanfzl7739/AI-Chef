// routes/nutrition.js
import express  from 'express';
import {
  analyzeNutrition, logMeal, getLogs, getSummary, removeMeal,
} from '../controllers/NutritionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze',                      analyzeNutrition);
router.post('/log',                          logMeal);
router.get('/logs',                          getLogs);
router.get('/summary',                       getSummary);
router.delete('/log/:logId/meal/:mealIdx',   removeMeal);

export default router;
