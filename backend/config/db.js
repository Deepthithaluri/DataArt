
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('quizmaster_db', 'root', 'bindustev@29', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
});
// Sync models with DB
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced successfully'))
  .catch(err => console.error('❌ Error syncing database:', err));


module.exports = sequelize;


