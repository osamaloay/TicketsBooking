const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');
const  authenticate  = require('../Middleware/authMiddleware');
const  authorize  = require('../Middleware/authorizeMiddleware');

// create new event by Organizer
router.post('/', authenticate, authorize('Organizer'), EventController.createEvent);

// get all events
router.get('/', authenticate, EventController.getApprovedEvents);

// get all events by organizer
router.get('/organizer/events', authenticate, authorize('Organizer'), EventController.getOrganizerEvents);

// get all events (admin only)
router.get('/all', authenticate, authorize('System Admin'), EventController.getAllEvents);

// get pending events (admin only)
router.get('/pending', authenticate, authorize('System Admin'), EventController.getPendingEvents);

// get details event by id
router.get('/:id', authenticate, EventController.getEventById);

// update an event by organizer or admin 
router.put('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.updateEvent);

// delete an event by Organizer or admin 
router.delete('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.deleteEvent);

// approve event (admin only)
router.put('/:id/approve', authenticate, authorize('System Admin'), EventController.approveEvent);

// reject event (admin only)
router.put('/:id/reject', authenticate, authorize('System Admin'), EventController.rejectEvent);

// Add route for updating event status
router.put('/:id/status', authenticate, authorize('System Admin'), EventController.updateEventStatus);

module.exports = router;