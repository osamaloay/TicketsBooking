const bookingModel = require('../Models/Booking');
const eventModel = require('../Models/Event');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const userModel = require('../Models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key
const createPDF = require('../utils/createPDF');
const path = require('path');
const fs = require('fs');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure nodemailer with error handling
let transporter;
try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
} catch (error) {
    console.error('Error configuring nodemailer:', error);
}

const BookingController = {
    // Book tickets for an event
    bookTicket: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { event, numberOfTickets, paymentMethodId } = req.body;
            const user = req.user._id;

            if (!event || !numberOfTickets || !paymentMethodId) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    required: ['event', 'numberOfTickets', 'paymentMethodId']
                });
            }

            // Fetch the event from the database
            const eventInstance = await eventModel.findById(event).session(session);
            if (!eventInstance) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (eventInstance.remainingTickets < numberOfTickets) {
                return res.status(400).json({ message: 'Not enough tickets available' });
            }

            const totalPrice = eventInstance.ticketPricing * numberOfTickets;
            eventInstance.remainingTickets -= numberOfTickets;
            await eventInstance.save({ session });

            try {
                // Initiate payment with Stripe
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(totalPrice * 100),
                    currency: 'usd',
                    payment_method: paymentMethodId,
                    confirm: true,
                    automatic_payment_methods: {
                        enabled: true,
                        allow_redirects: 'never',
                    },
                });

                if (paymentIntent.status !== 'succeeded') {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(500).json({
                        message: 'Payment failed',
                        details: paymentIntent.last_payment_error
                    });
                }

                // Create a new booking record
                const newBooking = new bookingModel({
                    user,
                    event,
                    numberOfTickets,
                    totalPrice,
                    status: 'confirmed',
                    payment_intent: paymentIntent.id
                });
                await newBooking.save({ session });

                const userInstance = await userModel.findById(user).session(session);
                if (!userInstance) {
                    throw new Error('User not found');
                }

                // Generate QR code
                const qrData = `Booking ID: ${newBooking._id}\nEvent: ${eventInstance.title}\nUser: ${userInstance.name}`;
                const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: 'png' });

                // Create PDF ticket
                const pdfPath = path.join(tempDir, `${newBooking._id}.pdf`);
                try {
                    await createPDF(
                        {
                            ...newBooking.toObject(),
                            event: eventInstance,
                            user: userInstance
                        },
                        qrCodeBuffer,
                        userInstance.profilePicture?.url,
                        pdfPath
                    );

                    // Verify PDF was created
                    if (!fs.existsSync(pdfPath)) {
                        throw new Error('PDF file was not created');
                    }

                    // Send email
                    if (!transporter) {
                        throw new Error('Email service not configured');
                    }

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: userInstance.email,
                        subject: `Booking Confirmation - ${eventInstance.title}`,
                        text: `Dear ${userInstance.name},\n\nYour booking for the event ${eventInstance.title} has been confirmed.\n\nPlease find your ticket attached.\n\nThank you for your purchase!`,
                        attachments: [{
                            filename: 'ticket.pdf',
                            path: pdfPath
                        }]
                    };

                    await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully');

                    // Clean up
                    if (fs.existsSync(pdfPath)) {
                        fs.unlinkSync(pdfPath);
                    }

                    await session.commitTransaction();
                    session.endSession();
                    res.status(201).json(newBooking);
                } catch (err) {
                    console.error('PDF/Email error details:', {
                        error: err.message,
                        stack: err.stack,
                        pdfPath,
                        email: userInstance.email
                    });

                    // Clean up PDF if it exists
                    if (fs.existsSync(pdfPath)) {
                        fs.unlinkSync(pdfPath);
                    }

                    await session.abortTransaction();
                    session.endSession();
                    res.status(500).json({
                        message: 'Error in ticket generation or email sending',
                        error: err.message,
                        details: 'Please contact support if this issue persists'
                    });
                }
            } catch (paymentError) {
                console.error('Payment error:', paymentError);
                await session.abortTransaction();
                session.endSession();
                res.status(500).json({
                    message: 'Payment processing failed',
                    error: paymentError.message
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({
                message: 'Error booking ticket',
                error: error.message
            });
        }
    },

    // Get booking details by ID
    getBookingDetails: async (req, res) => {
        try {
            const bookingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }

            const booking = await bookingModel.findById(bookingId)
                .populate('user', 'name email profilePicture')
                .populate('event');

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            // Check if user is authorized to view this booking
            if (req.user.role !== 'System Admin' && 
                req.user._id.toString() !== booking.user._id.toString() &&
                req.user._id.toString() !== booking.event.organizer.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this booking' });
            }

            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching booking details', error });
        }
    },

    // Cancel booking (and keep record)
    cancelBooking: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const bookingId = req.params.id;
          if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            throw new Error('Invalid booking ID');
          }
    
          const booking = await bookingModel.findById(bookingId).session(session);
          if (!booking) throw new Error('Booking not found');
    
          const event = await eventModel.findById(booking.event).session(session);
          if (!event) throw new Error('Event not found');
          // Refund the user via Stripe
        const refund = await stripe.refunds.create({

            payment_intent: booking.payment_intent, // Assume this ID was saved in the booking model

            });

        // If refund fails, abort transaction
        if (!refund) {
            throw new Error('Refund failed');
        }
    
          // Restore tickets
          event.remainingTickets += booking.numberOfTickets;
          await event.save({ session });
    
          // Cancel booking
          booking.status = 'canceled';
          await booking.save({ session });
    
          // Or you can fully delete it (optional)
          await bookingModel.findByIdAndDelete(bookingId).session(session);
    
          await session.commitTransaction();
          session.endSession();
          res.status(200).json({ message: 'Booking cancelled successfully' });
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({ message: 'Error cancelling booking', error });
        }
      },

    // Get bookings for a specific event (for organizers)
    getEventBookings: async (req, res) => {
        try {
            const eventId = req.params.eventId;
            
            if (!mongoose.Types.ObjectId.isValid(eventId)) {
                return res.status(400).json({ message: 'Invalid event ID' });
            }

            // Check if user is the organizer of this event
            const event = await eventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (req.user.role !== 'System Admin' && 
                req.user._id.toString() !== event.organizer.toString()) {
                return res.status(403).json({ message: 'Not authorized to view these bookings' });
            }

            const bookings = await bookingModel.find({ event: eventId })
                .populate('user', 'name email profilePicture')
                .populate('event');

            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching event bookings', error });
        }
    },

    // Get all bookings (admin or personal)
    getAllBookings: async (req, res) => {
        try {
            let query = {};
            
            // If user is not admin, only show their bookings or bookings for their events
            if (req.user.role !== 'System Admin') {
                const userEvents = await eventModel.find({ organizer: req.user._id });
                const eventIds = userEvents.map(event => event._id);
                
                query = {
                    $or: [
                        { user: req.user._id },
                        { event: { $in: eventIds } }
                    ]
                };
            }

            const bookings = await bookingModel.find(query)
                .populate('user', 'name email profilePicture')
                .populate('event');
                
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching bookings', error });
        }
    },

    // Get bookings for a specific user
    getUserBookings: async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            // Check if user is authorized to view these bookings
            if (req.user.role !== 'System Admin' && 
                req.user._id.toString() !== userId) {
                return res.status(403).json({ message: 'Not authorized to view these bookings' });
            }

            const bookings = await bookingModel.find({ user: userId })
                .populate('user', 'name email profilePicture')
                .populate('event');
                
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user bookings', error });
        }
    }
};

module.exports = BookingController;
