const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Returns 401 Unauthorized if:
//1-No token provided
//2-invalid token
//3-expired token
//4-no user found
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization && req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

//Returns 403 Forbidden if:   
//1-User doesn't have the required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};


module.exports = { protect, authorize };
