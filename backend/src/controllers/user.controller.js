const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');

const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { user: formatUser(user) },
      });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { firstName, lastName } = req.body;

      const user = await UserModel.update(req.user.id, {
        firstName,
        lastName,
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user: formatUser(user) },
      });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await UserModel.findByEmail(req.user.email);

      // Verify current password is correct
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await UserModel.updatePassword(req.user.id, hashedPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  deleteAccount: async (req, res, next) => {
    try {
      const { password } = req.body;

      // Verify password before deleting
      const user = await UserModel.findByEmail(req.user.email);
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Password is incorrect',
        });
      }

      await UserModel.delete(req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;