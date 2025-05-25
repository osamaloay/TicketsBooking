const userModel = require('../Models/User');
const bookingModel = require('../Models/Booking');
const eventModel = require('../Models/Event');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');


const userController = { 
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
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
        const { name, email } = req.body;
        try {
            const updateData = { name, email };

            // Handle image upload if present
            if (req.file) {
                // Delete old image if exists
                const user = await userModel.findById(userId);
                if (user.profilePicture?.public_id) {
                    await cloudinary.uploader.destroy(user.profilePicture.public_id);
                }

                // Add new image data
                updateData.profilePicture = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            }

            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log('Updated User:', updatedUser);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ message: 'Error updating user profile', error: error.message });
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
            const deletedUser = await userModel.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
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

    


}; 
module.exports = userController;