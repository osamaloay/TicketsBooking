const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const authenticate  = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');

// get all users ("only admin can get all users")
router.get('/', authenticate, authorize('System Admin'), UserController.getAllUsers);

// get current user profile 
router.get('/profile', authenticate, UserController.getUserProfile);

// update current user profile
router.put('/profile', authenticate, UserController.updateUserProfile);

// get details of a specific user ("only admin can get user details")
router.get('/:id', authenticate, authorize('System Admin'), UserController.getUsersDetails);

// update user role ("only admin can update user role")
router.put('/:id', authenticate, authorize('System Admin'), UserController.updateUserRole);

// delete user ("only admin can delete user")
router.delete('/:id', authenticate, authorize('System Admin'), UserController.deleteUser);

// get current user Bookings , it makes more since to let admins and event organizers to see all bookings
router.get('/booking', authenticate, authorize('Standard User'), UserController.getUserBooking);  // done implementing

// get current Organizer events 
router.get('/events', authenticate, authorize('Organizer'), UserController.getUserEvents);


// get analyics of current Organizer events
router.get('/events/analytics', authenticate, authorize('Organizer'), UserController.getUserEventsAnalytics);


module.exports = router;