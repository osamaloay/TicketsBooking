const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { createBooking,getBookingById,cancelBooking} = require('../controllers/BookingController');


router.post('/bookings', protect, authorize('Standard User'), createBooking);//create booking
router.get('/bookings/:id', protect, authorize('Standard User'), getBookingById);//get booking by id
router.delete('/bookings/:id', protect, authorize('Standard User'), cancelBooking);//delete booking

module.exports = router; 