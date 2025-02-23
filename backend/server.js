const express = require('express');
const cors = require('cors');
const passport = require('passport');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const promBundle = require('express-prom-bundle');

const app = express();

// Add security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable metrics collection
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: {project_name: 'ship_agency', project_type: 'backend'}
});
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// Initialize Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/vessels', require('./routes/vessels'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/email', require('./routes/email'));

// Database connection and server start
sequelize
  .sync()
  .then(() => {
    console.log('Database connected successfully');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server up and running on port ${port} !`));
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
