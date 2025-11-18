// models/Formula.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ✅ Import the instance

const Formula = sequelize.define('Formula', {
  subject: DataTypes.STRING,
  topic: DataTypes.STRING,
  formula: DataTypes.TEXT,
  description: DataTypes.TEXT
}, { timestamps: false });

module.exports = Formula;
