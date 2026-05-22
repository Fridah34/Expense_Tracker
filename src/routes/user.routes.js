const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const userValidator = require('../validators/user.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me
router.get('/me', userController.getProfile);

// PUT /api/users/me
router.put('/me', userValidator.update, validate, userController.updateProfile);

// PUT /api/users/me/password
router.put('/me/password', userValidator.changePassword, validate, userController.changePassword);

// DELETE /api/users/me
router.delete('/me', userController.deleteAccount);

module.exports = router;