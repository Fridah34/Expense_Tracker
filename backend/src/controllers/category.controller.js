const CategoryModel = require('../models/category.model');

const categoryController = {
  create: async (req, res, next) => {
    try {
      const { name, color, icon, budget, budgetPeriod, monthlyOverrides,monthlyBudgets,categoryType } = req.body;
      const userId = req.user.id;

      const existing = await CategoryModel.findByName(name, userId);
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'You already have a category with this name',
        });
      }

      const category = await CategoryModel.create({ 
        userId, 
        name, 
        color, 
        icon,
        budget: budget !== undefined ? budget : null,
        budgetPeriod: budgetPeriod || 'monthly',
        monthlyOverrides: monthlyOverrides || monthlyBudgets || {}
       });

      res.status(201).json({
        status: 'success',
        data: { category },
      });
    } catch (err) {
      next(err);
    }
  },

  findAll: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const categories = await CategoryModel.findAll(req.user.id, {
        startDate: startDate || null,
        endDate: endDate || null,
      });

      res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories },
      });
    } catch (err) {
      next(err);
    }
  },

  findOne: async (req, res, next) => {
    try {
      const category = await CategoryModel.findById(req.params.id, req.user.id);

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    console.log('=== UPDATE BODY RAW ===', JSON.stringify(req.body));
    try {
      const { name, color, icon, budget, budgetPeriod, monthlyOverrides,monthlyBudgets,categoryType, } = req.body;
      console.log('monthlyOverrides:', monthlyOverrides);   // ← add this
    console.log('monthlyBudgets:', monthlyBudgets);       // ← add this
    console.log('resolved:', monthlyOverrides || monthlyBudgets || {});
      const { id } = req.params;
      const userId = req.user.id;


      const existing = await CategoryModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      if (name && name !== existing.name) {
        const duplicate = await CategoryModel.findByName(name, userId);
        if (duplicate) {
          return res.status(409).json({
            status: 'error',
            message: 'You already have a category with this name',
          });
        }
      }

      const category = await CategoryModel.update(id, userId, { 
        name, 
        color, 
        icon,
        categoryType,
        budget: budget !== undefined ? budget : existing.budget,
        budgetPeriod: budgetPeriod || existing.budget_period || 'monthly',
        monthlyOverrides: monthlyOverrides || monthlyBudgets || {}
       });

      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const deleted = await CategoryModel.delete(req.params.id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoryController;