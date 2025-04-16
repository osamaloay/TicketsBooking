const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, forgetPassword } = require('../Controllers/AuthenticationController');
const { protect, authorize } = require('../Middleware/authMiddleware');




// Public routes
router.post('/register', registerUser);//register user
router.post('/login', loginUser);//login user
router.put('/forgetPassword', forgetPassword);//forget password

// Protected routes
router.get('/users/profile', protect, (req, res) => {
    res.json(req.user);//get user profile
});
router.put('/users/profile', protect, updateUserProfile);//update user profile




module.exports = router;