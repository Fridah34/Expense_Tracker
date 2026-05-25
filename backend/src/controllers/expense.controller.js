const ExpenseModel = require('../models/expense.model');
const CategoryModel = require('../models/category.model');

const expenseController = {
  create: async (req, res, next) => {
    try {
      const { title, amount, type, date, categoryId, notes } = req.body;
      const userId = req.user.id;

      // If categoryId provided — verify it belongs to this user
      if (categoryId) {
        const category = await CategoryModel.findById(categoryId, userId);
        if (!category) {
          return res.status(404).json({
            status: 'error',
            message: 'Category not found',
          });
        }
      }

      const expense = await ExpenseModel.create({
        userId,
        categoryId,
        title,
        amount,
        type,
        date,
        notes,
      });

      res.status(201).json({
        status: 'success',
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  },

  findAll: async (req, res, next) => {
    try {
      const filters = {
        type: req.query.type,
        categoryId: req.query.categoryId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
      };

      const result = await ExpenseModel.findAll(req.user.id, filters);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  findOne: async (req, res, next) => {
    try {
      const expense = await ExpenseModel.findById(req.params.id, req.user.id);

      if (!expense) {
        return res.status(404).json({
          status: 'error',
          message: 'Expense not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { title, amount, type, date, categoryId, notes } = req.body;

      // Check expense exists and belongs to user
      const existing = await ExpenseModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Expense not found',
        });
      }

      // If changing category — verify new category belongs to user
      if (categoryId) {
        const category = await CategoryModel.findById(categoryId, userId);
        if (!category) {
          return res.status(404).json({
            status: 'error',
            message: 'Category not found',
          });
        }
      }

      const expense = await ExpenseModel.update(id, userId, {
        categoryId,
        title,
        amount,
        type,
        date,
        notes,
      });

      res.status(200).json({
        status: 'success',
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const deleted = await ExpenseModel.delete(req.params.id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Expense not found',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  getSummary: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const now = new Date();
      const startDate = req.query.startDate ||
        new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString().split('T')[0];
      const endDate = req.query.endDate ||
        new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString().split('T')[0];

      const summary = await ExpenseModel.getSummary(userId, startDate, endDate);

      res.status(200).json({
        status: 'success',
        data: { summary, period: { startDate, endDate } },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = expenseController;