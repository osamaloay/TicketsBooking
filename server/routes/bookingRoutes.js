const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createBooking,
    getBooking,
    cancelBooking,
    getUserBookings
} = require('../controllers/bookingController');

// Create a new booking
router.post('/', protect, createBooking);

// Get a single booking
router.get('/:id', protect, getBooking);

// Cancel a booking
router.delete('/:id', protect, cancelBooking);

// Get all bookings for a user
router.get('/user/bookings', protect, getUserBookings);

module.exports = router; 