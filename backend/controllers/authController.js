const User = require('../models/User');
const authService = require('../services/authService');
const AppError = require('../utils/appError');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    const { token } = await authService.registerUser(email, password);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    const { token } = await authService.loginUser(email, password);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete all users except admins
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.cleanupUsers = async (req, res, next) => {
  try {
    // Only allow admin to perform this action
    if (req.user.role !== 'admin') {
      return next(new AppError('Unauthorized', 403));
    }
    
    const result = await authService.cleanupUsers();
    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (err) {
    next(err);
  }
};
