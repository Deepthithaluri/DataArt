const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  console.log("🔐 Auth middleware triggered");

  const rawToken = req.header('x-auth-token') || req.header('Authorization');
  const token = rawToken?.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

  if (!token) {
    console.warn("🚫 No token provided");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = {
  id: decoded.user.id,
  role: decoded.user.role
};



    console.log("✅ Token verified. User ID:", req.user.id);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
