const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  eta: {
    type: Date,
    required: true
  },
  etb: {
    type: Date
  },
  etd: {
    type: Date
  },
  services: {
    type: Object,
    default: {
      freshWater: false,
      provisions: false,
      wasteDisposal: false
    }
  },
  requests: {
    type: Object,
    default: {
      pilotage: false,
      towage: false,
      linesmen: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
