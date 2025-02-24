const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Middleware for protected routes
const authMiddleware = passport.authenticate('jwt', { session: false });

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();

    res.json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.generateAuthToken();

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all users except one
router.delete('/users/cleanup', authMiddleware, async (req, res) => {
  try {
    const { keepEmail } = req.body;
    
    if (!keepEmail) {
      return res.status(400).json({ message: 'keepEmail is required' });
    }

    // Delete all users except the one with keepEmail
    const result = await User.deleteMany({ email: { $ne: keepEmail } });
    
    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});

module.exports = router;
