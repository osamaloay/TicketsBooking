const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');
const  authenticate  = require('../Middleware/authMiddleware');
const  authorize  = require('../Middleware/authorizeMiddleware');



// create new event by Organizer
router.post('/', authenticate, authorize('Organizer'), EventController.createEvent);



// get all events
router.get('/', authenticate, EventController.getAllEvents);



// get details event by id
router.get('/:id', authenticate, EventController.getEventById);


// update an event by organizer or admin 
router.put('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.updateEvent);


// delete an event by Organizer or admin 
router.delete('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.deleteEvent);

module.exports = router;