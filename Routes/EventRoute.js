const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');
const { authenticate } = require('../middleware/authMiddleware');
const  authorize  = require('../middleware/authorizeMiddleware');



// create new event by Organizer
router.post('/', authenticate, authorize('Organizer'), EventController.createEvent);



// get all events
router.get('/', authenticate, EventController.getAllEvents);



// get event by id
router.get('/:id', authenticate, EventController.getEventById);


// update an event by organizer or admin 
router.put('/:id', authenticate, authorize('Organizer', 'Admin'), EventController.updateEvent);


// delete an event by Organizer or admin 
router.delete('/:id', authenticate, authorize('Organizer', 'Admin'), EventController.deleteEvent);