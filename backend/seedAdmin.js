const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/db');
const defineUser = require('./models/User');
const User = defineUser(sequelize, DataTypes); // ✅ Instantiate model

(async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database synced successfully');

    const adminUsername = 'MeAdmin';
    const adminEmail = 'meadmin@gmail.com';

    const existing = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: adminUsername },
          { email: adminEmail }
        ]
      }
    });

    if (existing) {
      console.log('✅ Admin user already exists:', existing.username);
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin' // ✅ normalized and explicit
    });

    console.log('✅ Admin user created successfully');
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  }
})();
