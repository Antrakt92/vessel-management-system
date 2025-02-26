const Vessel = require('../models/Vessel');

/**
 * Service for handling vessel-related business logic
 */
class VesselService {
  /**
   * Get all vessels
   * @returns {Promise<Array>} Array of vessel objects
   */
  async getAllVessels() {
    return await Vessel.find().sort({ createdAt: -1 });
  }

  /**
   * Create a new vessel
   * @param {Object} vesselData - Vessel data
   * @param {string} userId - ID of user creating the vessel
   * @returns {Promise<Object>} Created vessel object
   */
  async createVessel(vesselData, userId) {
    const vessel = new Vessel({
      ...vesselData,
      createdBy: userId
    });
    
    return await vessel.save();
  }

  /**
   * Update a vessel
   * @param {string} vesselId - Vessel ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated vessel object
   */
  async updateVessel(vesselId, updateData) {
    const vessel = await Vessel.findByIdAndUpdate(
      vesselId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!vessel) {
      const error = new Error('Vessel not found');
      error.statusCode = 404;
      throw error;
    }
    
    return vessel;
  }

  /**
   * Delete a vessel
   * @param {string} vesselId - Vessel ID
   * @returns {Promise<Object>} Deleted vessel object
   */
  async deleteVessel(vesselId) {
    const vessel = await Vessel.findByIdAndDelete(vesselId);
    
    if (!vessel) {
      const error = new Error('Vessel not found');
      error.statusCode = 404;
      throw error;
    }
    
    return vessel;
  }

  /**
   * Get vessel by ID
   * @param {string} vesselId - Vessel ID
   * @returns {Promise<Object>} Vessel object
   */
  async getVesselById(vesselId) {
    const vessel = await Vessel.findById(vesselId);
    
    if (!vessel) {
      const error = new Error('Vessel not found');
      error.statusCode = 404;
      throw error;
    }
    
    return vessel;
  }
}

module.exports = new VesselService();
