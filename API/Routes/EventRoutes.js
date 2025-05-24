const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');
const { authenticateToken, isAdmin, isOrganizer } = require('../Middleware/auth');

// Public routes
router.get('/events', EventController.getAllEvents);
router.get('/events/approved', EventController.getApprovedEvents);
router.get('/events/:id', EventController.getEventById);

// Organizer routes
router.post('/events', authenticateToken, isOrganizer, EventController.createEvent);
router.put('/events/:id', authenticateToken, isOrganizer, EventController.updateEvent);
router.delete('/events/:id', authenticateToken, isOrganizer, EventController.deleteEvent);
router.get('/organizer/events', authenticateToken, isOrganizer, EventController.getOrganizerEvents);

// Admin routes
router.get('/admin/events', authenticateToken, isAdmin, EventController.getAllEvents);
router.put('/admin/events/:id/approve', authenticateToken, isAdmin, EventController.approveEvent);
router.put('/admin/events/:id/reject', authenticateToken, isAdmin, EventController.rejectEvent);

module.exports = router; 