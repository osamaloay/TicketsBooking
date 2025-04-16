const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getUserBookings,
    getUserEvents,
    getUserEventsAnalytics
} = require('../controllers/UserController');

// Admin routes
router.get('/users', protect, authorize('System Admin'), getAllUsers);//get all users
router.get('/users/:id', protect, authorize('System Admin'), getUserById);//get user by id
router.put('/users/:id', protect, authorize('System Admin'), updateUserRole);//update user role
router.delete('/users/:id', protect, authorize('System Admin'), deleteUser);//delete user

// Standard User routes
router.get('/users/bookings', protect, authorize('Standard User'), getUserBookings);//get user bookings

// Organizer routes
router.get('/users/events', protect, authorize('Organizer'), getUserEvents);//get user events
router.get('/users/events/analytics', protect, authorize('Organizer'), getUserEventsAnalytics);//get user events analytics

module.exports = router; 