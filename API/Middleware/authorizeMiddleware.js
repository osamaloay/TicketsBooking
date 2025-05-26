// middleware/authorizeMiddleware.js
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        console.log('User role:', req.user.role);
        console.log('Required roles:', roles);
        
        // Convert both user role and required roles to uppercase for case-insensitive comparison
        const userRole = req.user.role.toUpperCase();
        const requiredRoles = roles.map(role => role.toUpperCase());
        
        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({ 
                message: `Not authorized. Your role: ${req.user.role}, Required roles: ${roles.join(', ')}` 
            });
        }
        
        next();
    };
};

module.exports = authorize;
  