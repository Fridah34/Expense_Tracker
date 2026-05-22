const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const categoryValidator = require('../validators/category.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

// All category routes require authentication
router.use(authenticate);

// POST /api/categories
router.post('/', categoryValidator.create, validate, categoryController.create);

// GET /api/categories
router.get('/', categoryController.findAll);

// GET /api/categories/:id
router.get('/:id', categoryValidator.validateId, validate, categoryController.findOne);

// PUT /api/categories/:id
router.put('/:id', categoryValidator.update, validate, categoryController.update);

// DELETE /api/categories/:id
router.delete('/:id', categoryValidator.validateId, validate, categoryController.delete);

module.exports = router;