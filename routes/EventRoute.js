const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
    getOrganizerEventsAnalytics, updateEventStatus } = require('../controllers/EventController');

// Public routes
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);

// Routes for Organizer to create event
router.post('/events', protect, authorize('Organizer'), createEvent);
router.get('/events/analytics', protect, authorize('Organizer'), getOrganizerEventsAnalytics);

// Routes for Admin to update event status
router.put('/events/:id/status', protect, authorize('System Admin'), updateEventStatus);

//Routes for Admins and Organizers
router.put('/events/:id', protect, authorize('Organizer', 'System Admin'), updateEvent);
router.delete('/events/:id', protect, authorize('Organizer', 'System Admin'), deleteEvent);

module.exports = router;