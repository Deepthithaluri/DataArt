const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizQuestion = sequelize.define('QuizQuestion', {
  subject: DataTypes.STRING,
  topic: DataTypes.STRING,
  questionText: DataTypes.TEXT,
  options: DataTypes.JSON,
  correctAnswer: DataTypes.STRING
}, {
  tableName: 'questionbanks', // ✅ match actual table name
  timestamps: false
});

module.exports = QuizQuestion;
