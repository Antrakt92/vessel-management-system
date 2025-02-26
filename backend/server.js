require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const morgan = require('morgan');

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

app.use(cors(corsOptions));

// Logger
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Create admin user after successful connection
    const User = require('./models/User');
    
    (async () => {
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
    })();
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/vessels', require('./routes/vessels'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/email', require('./routes/email'));

app.get('/', (req, res) => {
  res.json({ message: 'Vessel Management System API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
