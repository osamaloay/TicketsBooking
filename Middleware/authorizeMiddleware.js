// middleware/authorizeMiddleware.js
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


  module.exports = authorize;
  