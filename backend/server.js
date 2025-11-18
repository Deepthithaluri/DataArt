require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const { User } = require('./models');

// Models
const UserModel = require('./models/User');
const Quiz = require('./models');
const Question = require('./models/Question');
const Result = require('./models/Result');
const UserResponse = require('./models/UserResponse');

// Routers
const quizRouter = require('./routes/quizRouter');
const userRouter = require('./routes/userRouter');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const formulasRouter = require('./routes/formulas');
const questionBankRouter = require('./routes/questionBank');
const questionRoutes = require('./routes/questionRoutes');

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Associations ----------------
Quiz.hasMany(Question, { foreignKey: 'quiz_id' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

User.hasMany(UserResponse, { foreignKey: 'user_id' });
Quiz.hasMany(UserResponse, { foreignKey: 'quiz_id' });
UserResponse.belongsTo(User, { foreignKey: 'user_id' });
UserResponse.belongsTo(Quiz, { foreignKey: 'quiz_id' });

User.hasMany(Result, { foreignKey: 'user_id' });
Result.belongsTo(User, { foreignKey: 'user_id' });

Quiz.hasMany(Result, { foreignKey: 'quiz_id' });
Result.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful');

    await sequelize.sync({ alter: true });
    console.log('✅ All models synced to MySQL with associations');

    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📦 Tables in DB:', tables);

    // ✅ Seed admin user
    const existing = await User.findOne({ where: { email: 'meadmin@gmail.com' } });
    if (!existing) {
      await User.create({
        username: 'MeAdmin',
        email: 'meadmin@gmail.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: 'admin'
      });
      console.log('✅ Admin seeded');
    } else {
      console.log('✅ Admin already exists');
    }

    // ✅ Mount routes AFTER sync
    console.log("✅ userRouter loaded:", typeof userRouter);

    app.use('/api/users', userRouter);
    app.use('/quiz', quizRouter);
    app.use('/api/formulas', formulasRouter);
    app.use('/api/question-bank', questionBankRouter);
    app.use('/api/quizzes', quizRouter);
    app.use('/api/results', resultRoutes);
    app.use('/api/questions', questionRoutes);

    app.get('/', (req, res) => {
      res.send('🚀 ScoreMax API is running...');
    });

    // ✅ Direct test route
    app.post('/api/users/register', (req, res) => {
      console.log("🧪 Direct register route hit");
      res.json({ msg: "Direct register route works" });
    });

    // ✅ Fallback route
    app.use((req, res) => {
      res.status(404).send(`❌ Cannot ${req.method} ${req.originalUrl}`);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Sequelize connection or sync failed:', err);
  }
};

startServer();
