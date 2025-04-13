const Event = require('../models/Events');
const Booking = require('../models/Booking');

// Get all events (public access)
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' })
            .populate('organizer', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single event by ID (public access)
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Only return approved events to public
        if (event.status !== 'approved') {
            return res.status(403).json({ message: 'Event not available' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create event (organizer only)
const createEvent = async (req, res) => {
    try {
        if (req.user.role !== 'Organizer') {
            return res.status(403).json({ message: 'Only organizers can create events' });
        }

        const { title, description, date, location, category, image, ticketPricing, totalTickets } = req.body;

        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            image,
            ticketPricing,
            totalTickets,
            remainingTickets: totalTickets,
            organizer: req.user._id,
            status: 'pending'
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully and pending approval', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating event', error: error.message });
    }
};

// Update event (organizer only)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is the organizer of this event
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Only allow updating specific fields
        const { date, location, totalTickets } = req.body;
        
        if (date) event.date = date;
        if (location) event.location = location;
        if (totalTickets) {
            const ticketsSold = event.totalTickets - event.remainingTickets;
            if (totalTickets < ticketsSold) {
                return res.status(400).json({ message: 'Cannot set total tickets less than already sold tickets' });
            }
            event.totalTickets = totalTickets;
            event.remainingTickets = totalTickets - ticketsSold;
        }

        await event.save();
        res.json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete event (organizer only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.remove();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get organizer's events analytics
const getOrganizerEventsAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'Organizer') {
            return res.status(403).json({ message: 'Only organizers can view analytics' });
        }

        const events = await Event.find({ organizer: req.user._id })
            .populate('organizer', 'name email');

        const analytics = await Promise.all(events.map(async (event) => {
            const bookings = await Booking.find({ event: event._id });
            const ticketsSold = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
            const percentageBooked = (ticketsSold / event.totalTickets) * 100;

            return {
                eventId: event._id,
                title: event.title,
                totalTickets: event.totalTickets,
                ticketsSold,
                percentageBooked,
                status: event.status
            };
        }));

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Approve/Reject event
const updateEventStatus = async (req, res) => {
    try {
        if (req.user.role !== 'System Admin') {
            return res.status(403).json({ message: 'Only admins can update event status' });
        }

        const { status } = req.body;
        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = status;
        await event.save();

        res.json({ message: `Event ${status} successfully`, event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getOrganizerEventsAnalytics,
    updateEventStatus
};