const { body, param, query } = require('express-validator');

const expenseValidator = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Title must be between 2 and 255 characters'),

    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),

    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(['expense', 'income'])
      .withMessage('Type must be either expense or income'),

    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isDate()
      .withMessage('Date must be a valid date e.g. 2026-05-22'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Invalid category ID'),

    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid expense ID'),

    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Title must be between 2 and 255 characters'),

    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),

    body('type')
      .optional()
      .isIn(['expense', 'income'])
      .withMessage('Type must be either expense or income'),

    body('date')
      .optional()
      .isDate()
      .withMessage('Date must be a valid date e.g. 2026-05-22'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Invalid category ID'),

    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
  ],

  validateId: [
    param('id')
      .isUUID()
      .withMessage('Invalid expense ID'),
  ],

  filters: [
    query('type')
      .optional()
      .isIn(['expense', 'income'])
      .withMessage('Type must be expense or income'),

    query('startDate')
      .optional()
      .isDate()
      .withMessage('Start date must be a valid date'),

    query('endDate')
      .optional()
      .isDate()
      .withMessage('End date must be a valid date'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive number'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
};

module.exports = expenseValidator;