require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Environment variables loaded:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('PORT:', process.env.PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
  }
}

testConnection();
