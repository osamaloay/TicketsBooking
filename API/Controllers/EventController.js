const { findOneAndUpdate } = require('../Models/User');
const eventModel = require('../Models/Event');
const userModel = require('../Models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const EventController = {
    // create a new event
    createEvent: async (req, res) => {
        try {
            const eventData = {
                ...req.body,
                organizer: req.user.id,
                status: 'pending'
            };
            
            console.log('Creating event with data:', eventData);
            
            const event = await eventModel.create(eventData);
            console.log('Event created:', event);
            
            res.status(201).json({ 
                message: 'Event created successfully and pending approval', 
                event 
            });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ 
                message: 'Error creating event', 
                error: error.message 
            });
        }
    },
    getAllEvents: async (req, res) => {
        try {
            const events = await eventModel.find()
                .populate('organizer', 'name email')
                .sort({ createdAt: -1 });
            console.log(`Found ${events.length} total events`);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error fetching all events:', error);
            res.status(500).json({ message: 'Error fetching events', error: error.message });
        }
    },
    getEventById: async (req, res) => {
        try {
            console.log('Fetching event with ID:', req.params.id);
            const event = await eventModel.findById(req.params.id)
                .populate('organizer', 'name email');
            
            if (!event) {
                console.log('Event not found with ID:', req.params.id);
                return res.status(404).json({ message: 'Event not found' });
            }
            
            console.log('Event found:', {
                id: event._id,
                title: event.title,
                status: event.status
            });
            
            res.status(200).json(event);
        } catch (error) {
            console.error('Error in getEventById:', error);
            res.status(500).json({ 
                message: 'Error fetching event details', 
                error: error.message 
            });
        }
    },
    updateEvent: async (req, res) => {
        try { 
            const { id } = req.params;
            const { ...updateData } = req.body;
           
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
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Error updating event', error: error.message });
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
     }, 
     getApprovedEvents: async (req, res) => { 
        try {
            console.log('Fetching approved events...');
            const events = await eventModel.find({ status: 'approved' })
                .populate('organizer', 'name email')
                .sort({ createdAt: -1 });
            
            console.log(`Found ${events.length} approved events`);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error fetching approved events:', error);
            res.status(500).json({ 
                message: 'Error fetching approved events', 
                error: error.message 
            });
        }
    },
    getPendingEvents: async (req, res) => {
        try {
            const events = await eventModel.find({ status: 'pending' })
                .populate('organizer', 'name email');
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching pending events', error: error.message });
        }
    },
    approveEvent: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Approving event with ID:', id); // Debug log
            
            const event = await eventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            event.status = 'approved';
            await event.save();

            // Send email notification to organizer
            const organizer = await userModel.findById(event.organizer);
            if (organizer) {
                const mailOptions = {
                    from: `TicketNest <${process.env.EMAIL_USER}>`,
                    to: organizer.email,
                    subject: 'Your Event Has Been Approved',
                    text: `Your event "${event.title}" has been approved and is now live on TicketNest.`
                };
                await transporter.sendMail(mailOptions);
            }

            res.status(200).json({ message: 'Event approved successfully', event });
        } catch (error) {
            console.error('Error approving event:', error);
            res.status(500).json({ message: 'Error approving event', error: error.message });
        }
    },
    rejectEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const { rejectionReason } = req.body;
            console.log('Rejecting event with ID:', id, 'Reason:', rejectionReason); // Debug log
            
            const event = await eventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            event.status = 'rejected';
            event.rejectionReason = rejectionReason;
            await event.save();

            // Send email notification to organizer
            const organizer = await userModel.findById(event.organizer);
            if (organizer) {
                const mailOptions = {
                    from: `TicketNest <${process.env.EMAIL_USER}>`,
                    to: organizer.email,
                    subject: 'Your Event Has Been Rejected',
                    text: `Your event "${event.title}" has been rejected.\nReason: ${rejectionReason}\n\nYou can make the necessary changes and submit it again.`
                };
                await transporter.sendMail(mailOptions);
            }

            res.status(200).json({ message: 'Event rejected successfully', event });
        } catch (error) {
            console.error('Error rejecting event:', error);
            res.status(500).json({ message: 'Error rejecting event', error: error.message });
        }
    },
    getOrganizerEvents: async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                console.error('No user found in request');
                return res.status(401).json({ message: 'User not authenticated' });
            }

            console.log('Getting organizer events for user:', req.user.id);
            console.log('User role:', req.user.role);
            
            // Find all events for this organizer
            const events = await eventModel.find({ organizer: req.user.id })
                .populate('organizer', 'name email')
                .sort({ createdAt: -1 }); // Sort by newest first

            console.log(`Found ${events.length} events for organizer`);
            
            // Log detailed event information
            events.forEach(event => {
                console.log('Event details:', {
                    id: event._id,
                    title: event.title,
                    status: event.status,
                    date: event.date,
                    organizer: event.organizer
                });
            });
            
            if (!events || events.length === 0) {
                console.log('No events found for organizer');
                return res.status(200).json([]);
            }

            res.status(200).json(events);
        } catch (error) {
            console.error('Error in getOrganizerEvents:', error);
            res.status(500).json({ 
                message: 'Error fetching organizer events', 
                error: error.message 
            });
        }
    },
    updateEventStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            console.log('Updating event status:', { id, status });

            const event = await eventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Update the event status
            event.status = status;
            await event.save();

            console.log('Event status updated successfully:', event);
            res.status(200).json(event);
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).json({ message: 'Error updating event status', error: error.message });
        }
    },
    uploadEventImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No image file uploaded' });
            }

            // Create the full image URL including the API base URL
            const imageUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/events/${req.file.filename}`;
            
            console.log('Image uploaded successfully:', imageUrl);
            
            res.status(200).json({
                message: 'Image uploaded successfully',
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                message: 'Error uploading image',
                error: error.message 
            });
        }
    }
};

module.exports = EventController;