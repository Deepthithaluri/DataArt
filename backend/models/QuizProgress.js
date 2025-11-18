module.exports = (sequelize, DataTypes) => {
  return sequelize.define('QuizProgress', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id',
      },
    },
    current_question: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    elapsed_time: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'quiz_progress',
    timestamps: true,
    underscored: true,
  });
};
