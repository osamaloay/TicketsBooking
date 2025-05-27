const { findOneAndUpdate } = require('../Models/User');
const eventModel = require('../Models/Event');
const { cloudinary } = require('../config/cloudinary');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const bookingModel = require('../Models/Booking');

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
            console.log('Fetching all events...');
            console.log('User making request:', req.user);

            if (!req.user || req.user.role !== 'System Admin') {
                console.log('Unauthorized access attempt');
                return res.status(403).json({ 
                    message: 'Access denied. Only System Admins can view all events.' 
                });
            }

            const events = await eventModel.find()
                .populate('organizer', 'name email')
                .sort({ createdAt: -1 });

            console.log(`Found ${events.length} events`);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            res.status(500).json({ 
                message: 'Failed to fetch events',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try { 
            console.log('Update Event Request:', {
                params: req.params,
                body: req.body,
                user: req.user
            });

            const { id } = req.params;
            const updateData = { ...req.body };
           
            // Find the event first to check its current status
            const currentEvent = await eventModel.findById(id).session(session);
            if (!currentEvent) {
                console.log('Event not found:', id);
                throw new Error('Event not found');
            }

            console.log('Current Event:', {
                id: currentEvent._id,
                status: currentEvent.status,
                newStatus: updateData.status
            });

            // Only validate required fields if not just updating status
            if (!updateData.status || Object.keys(updateData).length > 1) {
                console.log('Validating required fields');
                const requiredFields = ['title', 'description', 'date', 'category', 'totalTickets', 'ticketPricing'];
                const missingFields = requiredFields.filter(field => !updateData[field]);
                
                if (missingFields.length > 0) {
                    console.log('Missing fields:', missingFields);
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                // Validate location data
                if (typeof updateData.location === 'string') {
                    try {
                        updateData.location = JSON.parse(updateData.location);
                    } catch (error) {
                        console.error('Location parse error:', error);
                        throw new Error('Invalid location format');
                    }
                }

                if (!updateData.location?.address || !updateData.location?.coordinates) {
                    console.log('Invalid location data:', updateData.location);
                    throw new Error('Location address and coordinates are required');
                }
            }

            // Handle image upload if present
            if (req.file) {
                console.log('Processing image upload');
                // Delete old image if exists
                if (currentEvent.image?.public_id) {
                    try {
                        await cloudinary.uploader.destroy(currentEvent.image.public_id);
                    } catch (error) {
                        console.error('Error deleting old image:', error);
                        throw new Error('Failed to delete old image');
                    }
                }

                // Add new image data
                updateData.image = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            }

            // Handle status transitions
            if (updateData.status && updateData.status !== currentEvent.status) {
                console.log('Processing status transition:', {
                    from: currentEvent.status,
                    to: updateData.status
                });

                const bookings = await bookingModel.find({ 
                    event: id,
                    status: 'confirmed'
                }).session(session);

                console.log('Found confirmed bookings:', bookings.length);

                // Handle transitions to pending
                if (updateData.status === 'pending') {
                    console.log('Processing transition to pending');
                    // Cancel all confirmed bookings when event becomes pending
                    for (const booking of bookings) {
                        try {
                            // Process refund via Stripe if payment_intent exists
                            if (booking.payment_intent) {
                                console.log('Processing refund for booking:', booking._id);
                                try {
                                    const refund = await stripe.refunds.create({
                                        payment_intent: booking.payment_intent,
                                    });

                                    if (!refund) {
                                        throw new Error('Refund failed');
                                    }
                                    console.log('Refund successful:', refund.id);
                                } catch (stripeError) {
                                    console.error('Stripe refund error:', stripeError);
                                    // Continue with booking cancellation even if refund fails
                                }
                            }

                            // Update booking status
                            booking.status = 'canceled';
                            await booking.save({ session });

                            // Restore tickets
                            currentEvent.remainingTickets += booking.numberOfTickets;
                        } catch (error) {
                            console.error(`Error processing booking ${booking._id}:`, error);
                            // Continue with other bookings even if one fails
                        }
                    }
                }
                // Handle transitions from declined
                else if (currentEvent.status === 'declined') {
                    console.log('Processing transition from declined');
                    if (updateData.status === 'approved' || updateData.status === 'confirmed') {
                        // Reset remaining tickets to total tickets when transitioning from declined
                        updateData.remainingTickets = updateData.totalTickets || currentEvent.totalTickets;
                    }
                }
            }

            console.log('Updating event with data:', updateData);

            // Update the event
            const updatedEvent = await eventModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true, session, runValidators: true }
            );

            if (!updatedEvent) {
                console.log('Failed to update event');
                throw new Error('Failed to update event');
            }

            await session.commitTransaction();
            console.log('Event updated successfully:', {
                id: updatedEvent._id,
                status: updatedEvent.status
            });
            res.status(200).json(updatedEvent);
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error updating event:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Handle different types of errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                console.log('Validation errors:', validationErrors);
                return res.status(400).json({ 
                    message: 'Validation Error', 
                    errors: validationErrors 
                });
            }
            
            res.status(500).json({ 
                message: error.message || 'Failed to update event',
                error: error.toString(),
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } finally {
            session.endSession();
        }
    }, 
    deleteEvent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const event = await eventModel.findById(req.params.id).session(session);
            if (!event) {
                throw new Error('Event not found');
            }

            // Find all confirmed bookings for this event
            const bookings = await bookingModel.find({ 
                event: req.params.id, 
                status: 'confirmed' 
            }).session(session);

            // Process refunds and cancel bookings
            for (const booking of bookings) {
                try {
                    // Process refund via Stripe
                    const refund = await stripe.refunds.create({
                        payment_intent: booking.payment_intent,
                    });

                    if (!refund) {
                        throw new Error('Refund failed');
                    }

                    // Update booking status
                    booking.status = 'canceled';
                    await booking.save({ session });
                } catch (error) {
                    console.error(`Error processing refund for booking ${booking._id}:`, error);
                    throw error;
                }
            }

            // Delete image from Cloudinary if exists
            if (event.image?.public_id) {
                await cloudinary.uploader.destroy(event.image.public_id);
            }

            // Delete the event
            await eventModel.findByIdAndDelete(req.params.id).session(session);

            await session.commitTransaction();
            res.status(200).json({ message: 'Event and associated bookings deleted successfully' });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        } finally {
            session.endSession();
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
            const { q, category, date, priceRange, sortBy } = req.query;
    
            // Build base query for approved events
            const searchQuery = {
                status: 'approved'
            };

            // Add text search if query exists
            if (q) {
                searchQuery.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { 'location.address': { $regex: q, $options: 'i' } }
                ];
            }

            // Add category filter
            if (category) {
                searchQuery.category = category;
            }

            // Add date filter
            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                searchQuery.date = {
                    $gte: startDate,
                    $lt: endDate
                };
            }

            // Add price range filter
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                searchQuery.ticketPricing = {};
                if (min) searchQuery.ticketPricing.$gte = min;
                if (max) searchQuery.ticketPricing.$lte = max;
            }

            // Build sort options
            let sortOptions = {};
            if (sortBy) {
                switch (sortBy) {
                    case 'date_asc':
                        sortOptions = { date: 1 };
                        break;
                    case 'date_desc':
                        sortOptions = { date: -1 };
                        break;
                    case 'price_asc':
                        sortOptions = { ticketPricing: 1 };
                        break;
                    case 'price_desc':
                        sortOptions = { ticketPricing: -1 };
                        break;
                    default:
                        sortOptions = { date: 1 };
                }
            } else {
                sortOptions = { date: 1 }; // Default sort by date ascending
            }

            console.log('Search Query:', searchQuery);
            console.log('Sort Options:', sortOptions);

            const events = await eventModel.find(searchQuery)
                .populate('organizer', 'name email')
                .sort(sortOptions);

            // Get unique categories for filter options
            const categories = await eventModel.distinct('category', { status: 'approved' });
    
            res.status(200).json({
                success: true,
                count: events.length,
                data: events,
                filters: {
                    categories,
                    priceRanges: [
                        { label: 'Under $50', value: '0-50' },
                        { label: '$50 - $100', value: '50-100' },
                        { label: '$100 - $200', value: '100-200' },
                        { label: 'Over $200', value: '200-1000' }
                    ],
                    sortOptions: [
                        { label: 'Date (Earliest)', value: 'date_asc' },
                        { label: 'Date (Latest)', value: 'date_desc' },
                        { label: 'Price (Low to High)', value: 'price_asc' },
                        { label: 'Price (High to Low)', value: 'price_desc' }
                    ]
                }
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