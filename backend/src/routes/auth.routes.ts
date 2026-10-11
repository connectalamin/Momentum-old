import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Stricter rate limiting for auth endpoints
// Configurable via RATE_LIMIT_AUTH_MAX env var (defaults to 5 for security)
const authMaxRequests = process.env.RATE_LIMIT_AUTH_MAX
  ? parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10)
  : 5;

const rateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000;

const authLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many authentication attempts, please try again later.',
      statusCode: 429
    });
  },
});

// Register route
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim()
  ],
  register
);

// Login route
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

// Get profile (protected route)
router.get('/profile', authenticate, getProfile);

export default router;
