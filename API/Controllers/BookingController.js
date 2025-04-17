const bookingModel = require('../Models/Booking');
const mongoose = require('mongoose');


const BookingController = {
    bookTicket: async (req, res) => {
        try {
            const { eventId, userId, seats } = req.body;
            const newBooking = new bookingModel({ eventId, userId, seats });
            await newBooking.save();
            res.status(201).json(newBooking);
        } catch (error) {
            res.status(500).json({ message: 'Error booking ticket', error });
        }
    },
    getBookingDetails: async (req, res) => {
        try {
            const bookingId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }
            const booking = await bookingModel.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching booking details', error });
        }
    },
    cancelBooking: async (req, res) => {
        try {
            const bookingId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }
            const booking = await bookingModel.findByIdAndDelete(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            res.status(200).json({ message: 'Booking cancelled successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error cancelling booking', error });
        }
    }
    
} ;
module.exports = BookingController;
