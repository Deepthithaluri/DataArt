module.exports = (sequelize, DataTypes) => {
  return sequelize.define('QuizResult', {
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
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSON, // stores answers with correctness
      allowNull: true,
    },
  }, {
    tableName: 'quiz_results',
    timestamps: true,
    underscored: false,
  });
};
