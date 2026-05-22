const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const expenseValidator = require('../validators/expense.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

// All expense routes require authentication
router.use(authenticate);

// GET /api/expenses/summary
router.get('/summary', expenseController.getSummary);

// POST /api/expenses
router.post('/', expenseValidator.create, validate, expenseController.create);

// GET /api/expenses
router.get('/', expenseValidator.filters, validate, expenseController.findAll);

// GET /api/expenses/:id
router.get('/:id', expenseValidator.validateId, validate, expenseController.findOne);

// PUT /api/expenses/:id
router.put('/:id', expenseValidator.update, validate, expenseController.update);

// DELETE /api/expenses/:id
router.delete('/:id', expenseValidator.validateId, validate, expenseController.delete);

module.exports = router;