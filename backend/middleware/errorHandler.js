/**
 * Global error handling middleware
 * Provides consistent error responses across the application
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = {};
    
    // Extract validation error messages
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value entered for ${Object.keys(err.keyValue)} field`;
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
