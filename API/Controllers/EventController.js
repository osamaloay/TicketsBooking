const { findOneAndUpdate } = require('../Models/User');
const eventModel = require('../Models/Event');
const { cloudinary } = require('../config/cloudinary');

const EventController = {
    // create a new event
    createEvent: async (req, res) => {
        try {
            const eventData = { ...req.body };

            // Handle image upload if present
            if (req.file) {
                eventData.image = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            }

            const event = new eventModel(eventData);
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
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
    }

};
module.exports = EventController;