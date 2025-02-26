const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

// Middleware for protected routes
const authMiddleware = passport.authenticate('jwt', { session: false });

// Register new user
router.post('/register', asyncHandler(authController.register));

// Login user
router.post('/login', asyncHandler(authController.login));

// Get current user
router.get('/me', authMiddleware, asyncHandler(authController.getCurrentUser));

// Delete all users except admins
router.delete('/users/cleanup', authMiddleware, asyncHandler(authController.cleanupUsers));

module.exports = router;
