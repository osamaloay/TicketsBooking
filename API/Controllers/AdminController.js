const userModel = require('../Models/User');
const eventModel = require('../Models/Event');
const bookingModel = require('../Models/Booking');

const AdminController = {
    getStats: async (req, res) => {
        try {
            // Get total users
            const totalUsers = await userModel.countDocuments();

            // Get total events
            const totalEvents = await eventModel.countDocuments();

            // Get total tickets sold and revenue from confirmed bookings
            const confirmedBookings = await bookingModel.find({ status: 'confirmed' });
            const totalTicketsSold = confirmedBookings.reduce((acc, booking) => acc + booking.numberOfTickets, 0);
            const totalRevenue = confirmedBookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

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
    }
};

module.exports = AdminController; 