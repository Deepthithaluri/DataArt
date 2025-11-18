// models/QuestionBank.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ✅ This line was missing or incorrect


const QuestionBank = sequelize.define('QuestionBank', {
  subject: DataTypes.STRING,
  topic: DataTypes.STRING,
  questionText: DataTypes.TEXT,
  options: DataTypes.JSON,
  correctAnswer: DataTypes.STRING,
  explanation: DataTypes.TEXT
}, {
  tableName: 'question_bank', // ✅ match actual table name
  timestamps: false
});

module.exports = QuestionBank;
