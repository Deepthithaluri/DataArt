module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Question', {
    questionText: {
      type: DataTypes.TEXT, // Use TEXT for longer questions
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
        quiz_id: { type: DataTypes.INTEGER, allowNull: true }

    
  }, {
    tableName: 'questions',
    timestamps: false,
  });
};
