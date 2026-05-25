const CategoryModel = require('../models/category.model');

const categoryController = {
  create: async (req, res, next) => {
    try {
      const { name, color, icon } = req.body;
      const userId = req.user.id;

      // Check duplicate name for this user
      const existing = await CategoryModel.findByName(name, userId);
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'You already have a category with this name',
        });
      }

      const category = await CategoryModel.create({ userId, name, color, icon });

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
      const categories = await CategoryModel.findAll(req.user.id);

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
    try {
      const { name, color, icon } = req.body;
      const { id } = req.params;
      const userId = req.user.id;

      // Check category exists and belongs to user
      const existing = await CategoryModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      // If renaming — check new name not already taken
      if (name && name !== existing.name) {
        const duplicate = await CategoryModel.findByName(name, userId);
        if (duplicate) {
          return res.status(409).json({
            status: 'error',
            message: 'You already have a category with this name',
          });
        }
      }

      const category = await CategoryModel.update(id, userId, { name, color, icon });

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