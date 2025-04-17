const express= require('express');
const router= express.Router();
const BookingController= require('../Controllers/BookingController');
const verifyToken = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');

// Book a ticket for an event 
router.post('/', verifyToken , authorize('Standard User'), BookingController.bookTicket);

// get booking details by id 
router.get('/:id', verifyToken , authorize('Standard User'), BookingController.getBookingDetails);

// cancel a booking by id
router.delete('/:id', verifyToken , authorize('Standard User'), BookingController.cancelBooking);

module.exports= router;
