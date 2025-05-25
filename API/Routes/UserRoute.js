const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const authenticate  = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');
const { upload } = require('../config/cloudinary');

// Specific routes first
router.get('/profile', authenticate, UserController.getUserProfile);
router.get('/booking', authenticate, authorize('Standard User'), UserController.getUserBooking);
router.get('/events', authenticate, authorize('Organizer'), UserController.getUserEvents);
router.get('/events/analytics', authenticate, authorize('Organizer'), UserController.getUserEventsAnalytics);

// Parameterized routes last
router.get('/', authenticate, authorize('System Admin'), UserController.getAllUsers);
router.get('/:id', authenticate, authorize('System Admin'), UserController.getUsersDetails);
router.put('/:id', authenticate, authorize('System Admin'), UserController.updateUserRole);
router.delete('/:id', authenticate, authorize('System Admin'), UserController.deleteUser);

// update current user profile
router.put('/profile', 
    authenticate, 
    upload.single('profilePicture'), 
    UserController.updateUserProfile
);

module.exports = router;