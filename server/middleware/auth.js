const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id);
        console.log('Found user:', user);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        console.log('User attached to request:', req.user);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 