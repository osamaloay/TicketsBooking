const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');
const authenticate = require('../Middleware/authMiddleware');
const authorize = require('../Middleware/authorizeMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Saving file to:', uploadsDir);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'event-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        console.log('Checking file:', {
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            console.log('Invalid file type:', file.mimetype);
            return cb(new Error('Only image files are allowed!'), false);
        }
        console.log('File accepted');
        cb(null, true);
    }
});

// Image upload route - make sure this is before other routes
router.post('/upload-image', authenticate, (req, res, next) => {
    console.log('Received upload request');
    console.log('Request headers:', req.headers);
    
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            console.error('No file uploaded');
            console.log('Request files:', req.files);
            console.log('Request body:', req.body);
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        console.log('File uploaded successfully:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        next();
    });
}, EventController.uploadEventImage);

// Public routes
router.get('/approved', EventController.getApprovedEvents); // Public route for approved events
router.get('/', EventController.getApprovedEvents); // Public route for approved events

// create new event by Organizer
router.post('/', authenticate, authorize('Organizer'), EventController.createEvent);

// get all events by organizer
router.get('/organizer/events', authenticate, authorize('Organizer'), EventController.getOrganizerEvents);

// get all events (admin only)
router.get('/all', authenticate, authorize('System Admin'), EventController.getAllEvents);

// get pending events (admin only)
router.get('/pending', authenticate, authorize('System Admin'), EventController.getPendingEvents);

// get details event by id (public route)
router.get('/:id', EventController.getEventById);

// update an event by organizer or admin 
router.put('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.updateEvent);

// delete an event by Organizer or admin 
router.delete('/:id', authenticate, authorize('Organizer', 'System Admin'), EventController.deleteEvent);

// approve event (admin only)
router.put('/:id/approve', authenticate, authorize('System Admin'), EventController.approveEvent);

// reject event (admin only)
router.put('/:id/reject', authenticate, authorize('System Admin'), EventController.rejectEvent);

// Add route for updating event status
router.put('/:id/status', authenticate, authorize('System Admin'), EventController.updateEventStatus);

module.exports = router;