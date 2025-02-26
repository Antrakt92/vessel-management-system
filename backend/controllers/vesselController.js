const Vessel = require('../models/Vessel');
const vesselService = require('../services/vesselService');

/**
 * Get all vessels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllVessels = async (req, res, next) => {
  try {
    const vessels = await vesselService.getAllVessels();
    res.json(vessels);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new vessel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createVessel = async (req, res, next) => {
  try {
    const vessel = await vesselService.createVessel(req.body, req.user._id);
    res.json(vessel);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a vessel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateVessel = async (req, res, next) => {
  try {
    const vessel = await vesselService.updateVessel(req.params.id, req.body);
    res.json(vessel);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a vessel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteVessel = async (req, res, next) => {
  try {
    await vesselService.deleteVessel(req.params.id);
    res.json({ message: 'Vessel deleted successfully' });
  } catch (err) {
    next(err);
  }
};
