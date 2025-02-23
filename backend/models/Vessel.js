const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vessel = sequelize.define('Vessel', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eta: {
    type: DataTypes.DATE,
    allowNull: false
  },
  etb: {
    type: DataTypes.DATE,
    allowNull: true
  },
  etd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  services: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      freshWater: false,
      provisions: false,
      wasteDisposal: false
    }
  },
  requests: {
    type: DataTypes.JSON,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Vessel;
