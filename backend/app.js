const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const vesselRoutes = require('./routes/vessels');
const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();

// Request logging middleware (should be first)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`, {
        body: req.body,
        headers: req.headers
    });
    next();
});

// Basic middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    next(err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/vessels', auth, vesselRoutes); // Protected route

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Ship Agency API is running' });
});

// Final error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// MongoDB connection with retry logic
const connectWithRetry = async () => {
    const MONGODB_URI = 'mongodb+srv://antrakt92:GdBopqQMVUvYAnnX@cluster0.wtuc5.mongodb.net/shipagency?retryWrites=true&w=majority&appName=Cluster0';
    
    const options = {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };
    
    try {
        await mongoose.connect(MONGODB_URI, options);
        console.log('MongoDB connected successfully');
        
        // Create admin user after successful connection
        try {
            const adminExists = await User.findOne({ role: 'admin' });
            if (!adminExists) {
                await User.create({
                    email: 'admin@shipagency.com',
                    password: 'admin123',
                    role: 'admin'
                });
                console.log('Admin user created successfully');
            }
        } catch (error) {
            console.error('Error creating admin user:', error);
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Initial connection attempt
connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
