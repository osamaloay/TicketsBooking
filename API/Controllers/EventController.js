const { findOneAndUpdate } = require('../Models/User');
const eventModel = require('../Models/Event');



const EventController = {
    // create a new event
    createEvent: async (req, res) => {
        try {
            const event = new eventModel(req.body);
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
            const { ...updateData } = req.body;
           
            const updatedEvent = await eventModel.findById(id);
            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
            
            await findOneAndUpdate({ _id: id }, updateData, { new: true });
            res.status(200).json(updatedEvent);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }, 
    deleteEvent: async (req, res) => {
        try {
            const event = await eventModel.findByIdAndDelete(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

};
module.exports = EventController;