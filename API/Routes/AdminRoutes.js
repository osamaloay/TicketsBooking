const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/AdminController');
const { isAuthenticated, isAdmin } = require('../Middleware/authMiddleware');

// Admin dashboard stats
router.get('/stats', isAuthenticated, isAdmin, adminController.getStats);

// Get all users
router.get('/users', isAuthenticated, isAdmin, adminController.getAllUsers);

// Get user details
router.get('/users/:id', isAuthenticated, isAdmin, adminController.getUserDetails);

// Create user
router.post('/users', isAuthenticated, isAdmin, adminController.createUser);

// Delete user
router.delete('/users/:id', isAuthenticated, isAdmin, adminController.deleteUser);

// Get all events
router.get('/events', isAuthenticated, isAdmin, adminController.getAllEvents);

// Get event details
router.get('/events/:id', isAuthenticated, isAdmin, adminController.getEventDetails);

module.exports = router; 