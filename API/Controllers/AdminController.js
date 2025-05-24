const User = require('../Models/User');
const Event = require('../Models/Event');
const Ticket = require('../Models/Ticket');

const adminController = {
  // Get dashboard statistics
  getStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalEvents = await Event.countDocuments();
      const totalTicketsSold = await Ticket.countDocuments();
      const totalRevenue = await Ticket.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);

      res.json({
        totalUsers,
        totalEvents,
        totalTicketsSold,
        totalRevenue: totalRevenue[0]?.total || 0
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Get user details
  getUserDetails: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user details:', error);
      res.status(500).json({ message: 'Error fetching user details' });
    }
  },

  // Create user
  createUser: async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  // Get all events
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  },

  // Get event details
  getEventDetails: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error getting event details:', error);
      res.status(500).json({ message: 'Error fetching event details' });
    }
  }
};

module.exports = adminController; 