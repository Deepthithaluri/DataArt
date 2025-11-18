const { User } = require('../models');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = isAdmin;
