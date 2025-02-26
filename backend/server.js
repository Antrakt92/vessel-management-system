require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const connectDB = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin matches any allowed patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
        return pattern.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Passport Configuration
require('./config/passport')(passport);

// Connect to MongoDB
connectDB()
  .then(async () => {
    // Create admin users after successful connection
    try {
      // Check for admin@shipagency.com
      const shipAdminExists = await User.findOne({ email: 'admin@shipagency.com' });
      if (!shipAdminExists) {
        await User.create({
          email: 'admin@shipagency.com',
          password: 'admin123',
          role: 'admin'
        });
        console.log('Ship Agency admin user created successfully');
      }
      
      // Check for admin@vessel.com
      const vesselAdminExists = await User.findOne({ email: 'admin@vessel.com' });
      if (!vesselAdminExists) {
        await User.create({
          email: 'admin@vessel.com',
          password: 'admin123',
          role: 'admin'
        });
        console.log('Vessel admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating admin users:', error);
    }
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/vessels', require('./routes/vessels'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/health', require('./routes/health'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Vessel Management System API' });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
});

module.exports = app; // Export for testing
