const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent
} = require('../controllers/eventController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', auth, upload.single('image'), createEvent);
router.put('/:id', auth, upload.single('image'), updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router; 