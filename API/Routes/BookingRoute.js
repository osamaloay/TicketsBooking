const express = require('express');
const router = express.Router();
const BookingController = require('../Controllers/BookingController');
const authenticate = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');

// Book tickets for an event
router.post('/', authenticate, BookingController.bookTicket);

// Get booking details by ID
router.get('/:id', authenticate, BookingController.getBookingDetails);

// Get bookings for a specific event (for organizers)
router.get('/event/:eventId', authenticate, authorize('Organizer', 'System Admin'), BookingController.getEventBookings);

// Get all bookings (admin or personal)
router.get('/', authenticate, BookingController.getAllBookings);

// Get bookings for a specific user
router.get('/user/:userId', authenticate, BookingController.getUserBookings);

// Cancel booking
router.delete('/:id', authenticate, BookingController.cancelBooking);

module.exports = router;
