const userModel = require('../Models/User');
const bookingModel = require('../Models/Booking');
const eventModel = require('../Models/Event');
const mongoose = require('mongoose');


const userController = { 
    getAllUsers: async (req, res) => {
        try {
            console.log('Getting all users...');
            console.log('User making request:', req.user);
            
            const users = await userModel.find();
            console.log('Found users:', users);
            
            // Remove sensitive information before sending
            const sanitizedUsers = users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }));
            
            console.log('Sending sanitized users:', sanitizedUsers);
            res.status(200).json(sanitizedUsers);
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    },
    getUserProfile : async (req, res) => {
        const userId = req.user.id;
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user profile', error });
        }
    },
    updateUserProfile : async (req, res) => {
        const userId = req.user.id;
        const { name, email, profilePicture } = req.body;
        try {
            const updatedUser = await userModel.findByIdAndUpdate(userId, { name, email, profilePicture }, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user profile', error });
        }
    },
    getUserProfile : async (req, res) => {
        try {
            const user = await userModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user); 
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching user profile', error });
        }
    },
    updateUserRole : async (req, res) => { 
        try { 
            const userId = req.params.id;
            const { role } = req.body;
            const userToUpdate = await findByIdAndUpdate(userId, { role }, { new: true });
            if (!userToUpdate) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(userToUpdate);
        }
        catch (error) {
    
            res.status(500).json({ message: 'Error updating user role', error });
        }
        
    },
    deleteUser : async (req, res) => {
        try {
            const userId = req.params.id;
            
            // Find the user first to check their role
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // If user is an organizer, delete all their events first
            if (user.role === 'Organizer') {
                console.log(`Deleting events for organizer: ${userId}`);
                const deletedEvents = await eventModel.deleteMany({ organizer: userId });
                console.log(`Deleted ${deletedEvents.deletedCount} events`);
            }

            // Delete the user
            const deletedUser = await userModel.findByIdAndDelete(userId);
            console.log(`Deleted user: ${userId}`);

            res.status(200).json({ 
                message: 'User and associated data deleted successfully',
                deletedEvents: user.role === 'Organizer' ? deletedEvents.deletedCount : 0
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    },
    getUserBooking : async (req, res) => {
        try {
            const userId = req.user.id;
            const bookings = await bookingModel.find({ user: userId }).populate('event');
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user bookings', error });
        }
    }, 
    getUserEvents : async (req, res) => {
        try {
            const userId = req.user.id;
            const events = await eventModel.find({ organizer: userId });
            if (!events) {
                return res.status(404).json({ message: 'No events found for this user' });
            }
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user events', error });
        }
    },
    getUserEventsAnalytics: async (req, res) => {
        try {
            const userId = req.user.id;
        
            // 1. Get all events created by this organizer
            const events = await eventModel.find({ organizer: userId });
        
            if (!events.length) {
              return res.status(404).json({ message: 'No events found for this user' });
            }
        
            const eventIds = events.map(event => event._id);
        
            // 2. Get all bookings related to these events
            const bookings = await bookingModel.find({ event: { $in: eventIds }, status: 'confirmed' });
        
            // 3. Prepare analytics
            const analytics = events.map(event => {
              const relatedBookings = bookings.filter(
                booking => booking.event.toString() === event._id.toString()
              );
        
              const totalTicketsSold = relatedBookings.reduce((acc, booking) => acc + booking.numberOfTickets, 0);
              const totalRevenue = relatedBookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        
              const percentageBooked = event.totalTickets > 0
                ? ((totalTicketsSold / event.totalTickets) * 100).toFixed(2)
                : 0;
        
              return {
                eventId: event._id,
                eventTitle: event.title,
                totalBookings: relatedBookings.length,
                totalTicketsSold,
                totalRevenue,
                totalTickets: event.totalTickets,
                remainingTickets: event.remainingTickets,
                percentageBooked: Number(percentageBooked),
              };
            });
        
            return res.status(200).json(analytics);
        
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching event analytics', error });
          }
    },
    getUsersDetails : async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user details', error });
        }
    },
    getAdminStats: async (req, res) => {
        try {
            // Get total users
            const totalUsers = await userModel.countDocuments();
            console.log('Total users:', totalUsers);

            // Get total events (all statuses)
            const totalEvents = await eventModel.countDocuments({});
            console.log('Total events:', totalEvents);

            // Get total tickets sold and revenue from confirmed bookings
            const confirmedBookings = await bookingModel.find({ status: 'confirmed' });
            console.log('Confirmed bookings:', confirmedBookings);

            const totalTicketsSold = confirmedBookings.reduce((acc, booking) => acc + booking.numberOfTickets, 0);
            const totalRevenue = confirmedBookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
            console.log('Total tickets sold:', totalTicketsSold);
            console.log('Total revenue:', totalRevenue);

            res.status(200).json({
                totalUsers,
                totalEvents,
                totalTicketsSold,
                totalRevenue
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            res.status(500).json({ message: 'Error fetching admin statistics', error: error.message });
        }
    },
}; 
module.exports = userController;