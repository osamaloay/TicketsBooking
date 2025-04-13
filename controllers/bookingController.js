const Booking = require('../models/Booking');
const Event = require('../models/Events');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { eventId, numberOfTickets } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot book tickets for unapproved events' });
    }

    // Check ticket availability
    if (event.remainingTickets < numberOfTickets) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Calculate total price
    const totalPrice = event.ticketPricing * numberOfTickets;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      numberOfTickets,
      totalPrice,
      status: 'pending'
    });

    // Update event's remaining tickets
    event.remainingTickets -= numberOfTickets;
    await event.save();

    // Save booking
    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date location')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the current user
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the current user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'canceled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update event's remaining tickets
    const event = await Event.findById(booking.event);
    event.remainingTickets += booking.numberOfTickets;
    await event.save();

    // Update booking status
    booking.status = 'canceled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  cancelBooking
}; 