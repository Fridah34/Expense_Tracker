const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post(
  '/register',
  authValidator.register,
  validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authValidator.login,
  validate,
  authController.login
);

// GET /api/auth/profile  — protected
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

module.exports = router;