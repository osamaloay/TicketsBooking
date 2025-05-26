const { findOneAndUpdate } = require('../Models/User');
const eventModel = require('../Models/Event');
const { cloudinary } = require('../config/cloudinary');

const EventController = {
    // create a new event
    createEvent : async (req, res) => {
        try {
            console.log('Received event data:', req.body);
            console.log('Received file:', req.file);
            console.log('User:', req.user);
    
            const eventData = { ...req.body };
    
            // Parse location if it's a string
            if (typeof eventData.location === 'string') {
                try {
                    eventData.location = JSON.parse(eventData.location);
                } catch (error) {
                    console.error('Error parsing location:', error);
                    return res.status(400).json({ message: 'Invalid location format' });
                }
            }
    
            // Handle image upload if present
            if (req.file) {
                eventData.image = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            }
    
            // Set organizer from authenticated user
            eventData.organizer = req.user._id;
    
            console.log('Processed event data:', eventData);
    
            const event = new eventModel(eventData);
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            console.error('Error creating event:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ 
                    message: 'Validation Error', 
                    errors: validationErrors 
                });
            }
            
            res.status(400).json({ 
                message: error.message,
                error: error.toString()
            });
        }
    },
    getAllEvents: async (req, res) => {
        try {
            const events = await eventModel.find();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } 
    ,
    getEventById: async (req, res) => {
        try {
            const event = await eventModel.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateEvent : async (req, res) => {
        try { 
            const { id } = req.params;
            const updateData = { ...req.body };
           
            // Handle image upload if present
            if (req.file) {
                const event = await eventModel.findById(id);
                
                // Delete old image if exists
                if (event.image?.public_id) {
                    await cloudinary.uploader.destroy(event.image.public_id);
                }

                // Add new image data
                updateData.image = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            }

            const updatedEvent = await eventModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(updatedEvent);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }, 
    deleteEvent: async (req, res) => {
        try {
            const event = await eventModel.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Delete image from Cloudinary if exists
            if (event.image?.public_id) {
                await cloudinary.uploader.destroy(event.image.public_id);
            }

            await eventModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
     }, 
     getApprovedEvents: async (req, res) => { 
        try {
            const events = await eventModel.find({ status: 'approved' });
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
     searchEvents : async (req, res) => {
        try {
            const { q } = req.query;
    
            if (!q) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Search query is required' 
                });
            }
    
            // Build search query for approved events only
            const searchQuery = {
                $and: [
                    { status: 'approved' },
                    {
                        $or: [
                            { title: { $regex: q, $options: 'i' } },
                            { description: { $regex: q, $options: 'i' } },
                            { location: { $regex: q, $options: 'i' } }
                        ]
                    }
                ]
            };
    
            const events = await Event.find(searchQuery)
                .populate('organizer', 'name email')
                .sort({ date: 1 });
    
            res.status(200).json({
                success: true,
                count: events.length,
                data: events
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error searching events',
                error: error.message 
            });
        }
    }
    

};
module.exports = EventController;