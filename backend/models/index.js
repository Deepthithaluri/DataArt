const Sequelize = require('sequelize');
const sequelize = require('../config/db');

// Import model factories
const UserModel = require('./User');
const QuizModel = require('./Quiz');
const QuizResultModel = require('./QuizResult');
const QuizProgressModel = require('./QuizProgress');
const QuestionModel = require('./Question');

// Import directly defined model
const QuizQuestion = require('./QuizQuestion'); // ✅ no invocation

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Quiz = QuizModel(sequelize, Sequelize.DataTypes);
const QuizResult = QuizResultModel(sequelize, Sequelize.DataTypes);
const QuizProgress = QuizProgressModel(sequelize, Sequelize.DataTypes);
const Question = QuestionModel(sequelize, Sequelize.DataTypes);

// Define associations
User.hasMany(Quiz, { foreignKey: 'created_by' });
Quiz.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(QuizResult, { foreignKey: 'user_id' });
QuizResult.belongsTo(User, { foreignKey: 'user_id' });

Quiz.hasMany(QuizResult, { foreignKey: 'quiz_id' });
QuizResult.belongsTo(Quiz, { foreignKey: 'quiz_id' });

User.hasMany(QuizProgress, { foreignKey: 'user_id' });
QuizProgress.belongsTo(User, { foreignKey: 'user_id' });

Quiz.hasMany(QuizProgress, { foreignKey: 'quiz_id' });
QuizProgress.belongsTo(Quiz, { foreignKey: 'quiz_id' });

Quiz.hasMany(Question, { foreignKey: 'quiz_id' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Quiz,
  QuizResult,
  QuizProgress,
  Question,
  QuizQuestion 
};
