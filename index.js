// ============================================================
// AI Chef — Express Server Entry Point
// ============================================================
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import auth from './routes/auth.js';
import  recipes from './routes/recipe.js'
import user from './routes/user.js';
import nutrition from './routes/nutrition.js'


dotenv.config()
const app = express();

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

// ── Core Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── API Routes ────────────────────────────────────────────────

app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/recipes',  recipes);
app.use('/api/nutrition', nutrition);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🍳 AI Chef server running on port ${PORT}`));

export default app;
