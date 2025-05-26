const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title image date location')
            .sort('-createdAt');
        
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching bookings',
            error: error.message 
        });
    }
});

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('event', 'title image date location')
            .populate('user', 'name email');

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Check if the booking belongs to the user
        if (booking.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this booking');
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            message: error.message || 'Error fetching booking',
            error: error.message 
        });
    }
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    try {
        const { event, numberOfTickets, paymentMethodId } = req.body;

        // Validate input
        if (!event || !numberOfTickets || !paymentMethodId) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }

        // Get event details
        const eventDetails = await Event.findById(event);
        if (!eventDetails) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Check if enough tickets are available
        if (eventDetails.remainingTickets < numberOfTickets) {
            res.status(400);
            throw new Error('Not enough tickets available');
        }

        // Calculate total price
        const totalPrice = eventDetails.ticketPricing * numberOfTickets;

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100, // Convert to cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: `${process.env.CLIENT_URL}/bookings`,
        });

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            event: event,
            numberOfTickets,
            totalPrice,
            paymentIntentId: paymentIntent.id,
            status: 'confirmed'
        });

        // Update event remaining tickets
        eventDetails.remainingTickets -= numberOfTickets;
        await eventDetails.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Error creating booking'
        });
    }
});

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Check if the booking belongs to the user
        if (booking.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to cancel this booking');
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            res.status(400);
            throw new Error('Booking is already cancelled');
        }

        // Refund the payment
        if (booking.paymentIntentId) {
            await stripe.refunds.create({
                payment_intent: booking.paymentIntentId
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Update event remaining tickets
        const event = await Event.findById(booking.event);
        event.remainingTickets += booking.numberOfTickets;
        await event.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Error cancelling booking'
        });
    }
});

// @desc    Download booking ticket
// @route   GET /api/bookings/:id/ticket
// @access  Private
const downloadTicket = asyncHandler(async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('event', 'title date location')
            .populate('user', 'name email');

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Check if the booking belongs to the user
        if (booking.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to download this ticket');
        }

        // Check if booking is confirmed
        if (booking.status !== 'confirmed') {
            res.status(400);
            throw new Error('Cannot download ticket for cancelled booking');
        }

        // Generate ticket data
        const ticketData = {
            bookingId: booking._id,
            eventTitle: booking.event.title,
            eventDate: booking.event.date,
            eventLocation: booking.event.location,
            userName: booking.user.name,
            userEmail: booking.user.email,
            quantity: booking.numberOfTickets,
            totalPrice: booking.totalPrice,
            status: booking.status
        };

        res.status(200).json(ticketData);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            message: error.message || 'Error downloading ticket',
            error: error.message 
        });
    }
});

module.exports = {
    getUserBookings,
    getBooking,
    createBooking,
    cancelBooking,
    downloadTicket
}; 