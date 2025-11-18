module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Quiz', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
   quiz_id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  //autoIncrement: true
},


    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    takenBy: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'quizzes',
    timestamps: true, // adds createdAt and updatedAt
    // removed underscored: true to match camelCase columns in DB
  });
};
