const { body, param } = require('express-validator');

const categoryValidator = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),

    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color e.g. #6366f1'),

    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon name cannot exceed 50 characters'),
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid category ID'),

    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),

    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color e.g. #6366f1'),

    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon name cannot exceed 50 characters'),
  ],

  validateId: [
    param('id')
      .isUUID()
      .withMessage('Invalid category ID'),
  ],
};

module.exports = categoryValidator;