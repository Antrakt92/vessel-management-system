const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Check the health of the application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkHealth = asyncHandler(async (req, res) => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        status: 'ok',
        database: {
            state: states[state],
            connected: state === 1
        },
        api: 'running'
    });
});
