// middleware/authorizeMiddleware.js
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        console.log('User role:', req.user.role);
        console.log('Required roles:', roles);
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Not authorized. Your role: ${req.user.role}, Required roles: ${roles.join(', ')}` 
            });
        }
        
        next();
    };
};

module.exports = authorize;
  