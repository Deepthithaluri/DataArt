const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserResponse = sequelize.define('UserResponse', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  responses: {
    type: DataTypes.JSON, // Stores answers like { "1": "a", "2": "c" }
    allowNull: false,
  },
});

module.exports = UserResponse;
