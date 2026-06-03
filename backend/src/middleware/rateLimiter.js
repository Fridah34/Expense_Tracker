const rateLimit = require('express-rate-limit');

//Global limiter
const globalLimiter = rateLimit({
    windowMs: 10 *60 *1000,
    max: 1000 ,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        status:'error',
        message: 'Too many requests. Please slow down and try again in 10 minutes.',
    },
    skip: () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
});

// ─── Auth Limiter ────────────────────────────────────────────────────
// Applied only to /api/auth routes
// 10 attempts per 15 minutes — stops brute force and fake registrations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:  1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
});

// ─── Write Limiter ───────────────────────────────────────────────────
// Applied to POST/PUT/DELETE on expenses and categories
// 30 writes per minute — stops spam inserts
const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please wait a moment before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'development'  || process.env.NODE_ENV === 'test',
});

module.exports = { globalLimiter, authLimiter, writeLimiter };