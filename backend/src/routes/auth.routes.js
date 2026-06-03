const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  authValidator.register,
  validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  authValidator.login,
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh', authController.refresh);

// GET /api/auth/profile  — protected
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

module.exports = router;