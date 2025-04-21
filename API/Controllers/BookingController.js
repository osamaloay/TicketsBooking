const bookingModel = require('../Models/Booking');
const eventModel = require('../Models/Event');
const mongoose = require('mongoose');

const BookingController = {
    // Book tickets for an event
    bookTicket: async (req, res) => {
        try {
            const { event , user , numberOfTickets } = req.body;

            if (!event || !user || !numberOfTickets) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const eventInstance = await eventModel.findById(event);
            if (!eventInstance) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (eventInstance.remainingTickets < numberOfTickets) {
                return res.status(400).json({ message: 'Not enough tickets available' });
            }

            const totalPrice = eventInstance.ticketPricing * numberOfTickets;
            eventInstance.remainingTickets -= numberOfTickets;
            await eventInstance.save();

            const newBooking = new bookingModel({
                user,
                event,
                numberOfTickets,
                totalPrice,
                status: 'confirmed'
            });

            await newBooking.save();
            const populatedBooking = await newBooking.populate('user event');

            res.status(201).json(populatedBooking);
        } catch (error) {
            res.status(500).json({ message: 'Error booking ticket', error });
        }
    },

    // Get booking details by ID
    getBookingDetails: async (req, res) => {
        try {
            const bookingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }

            const booking = await bookingModel.findById(bookingId).populate('user event');

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching booking details', error });
        }
    },

    // Cancel booking (and keep record)
    cancelBooking: async (req, res) => {
        try {
            const bookingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }

            const booking = await bookingModel.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            const event = await eventModel.findById(booking.event);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            event.remainingTickets += booking.numberOfTickets;
            await event.save();

            booking.status = 'canceled';
            await booking.save();

            res.status(200).json({ message: 'Booking cancelled successfully', booking });
        } catch (error) {
            res.status(500).json({ message: 'Error cancelling booking', error });
        }
    },

    // Get all bookings (admin or personal)
    getAllBookings: async (req, res) => {
        try {
            const bookings = await bookingModel.find().populate('user event');
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching bookings', error });
        }
    },

    // Get bookings for a specific user
    getUserBookings: async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const bookings = await bookingModel.find({ user: userId }).populate('event');
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user bookings', error });
        }
    }
};

module.exports = BookingController;
