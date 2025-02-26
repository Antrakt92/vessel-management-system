const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Service for handling authentication-related business logic
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (default: 'user')
   * @returns {Promise<Object>} User object with token
   */
  async registerUser(email, password, role = 'user') {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = new User({ email, password, role });
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();

    return { user, token };
  }

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object with token
   */
  async loginUser(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 400);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 400);
    }

    // Generate token
    const token = user.generateAuthToken();

    return { user, token };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Delete all non-admin users
   * @returns {Promise<Object>} Result of deletion
   */
  async cleanupUsers() {
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    return { deletedCount: result.deletedCount };
  }
}

module.exports = new AuthService();
