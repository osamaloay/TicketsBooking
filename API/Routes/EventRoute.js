const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');
const { upload } = require('../config/cloudinary');
const authenticate = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');

// Public routes
router.get('/', EventController.getApprovedEvents);
router.get('/search', EventController.searchEvents);

// Protected routes
// get all events (admin only)
router.get('/all', authenticate, authorize('System Admin'), EventController.getAllEvents);

// get event by id (public)
router.get('/:id', EventController.getEventById);

// create new event by Organizer
router.post('/', authenticate, authorize('Organizer'), upload.single('image'), EventController.createEvent);

// update an event by organizer or admin 
router.put('/:id', authenticate, authorize('Organizer', 'System Admin'), upload.single('image'), EventController.updateEvent);

// delete an event by Organizer or admin 
router.delete('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.deleteEvent);

module.exports = router;
