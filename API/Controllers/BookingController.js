const bookingModel = require('../Models/Booking');
const eventModel = require('../Models/Event');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const userModel = require('../Models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD,
    },
  });








const BookingController = {
    // Book tickets for an event
    bookTicket: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
<<<<<<< HEAD
            const { eventId, userId, seats } = req.body;

            // 1. Prepare Booking Data
            const bookingData = {
                event: eventId,  //  Explicitly name the properties
                user: userId,   //   to match the model
                seats: seats
            };

            // 2. Create Booking Instance
            const bookingInstance = new bookingModel(bookingData);

            // 3. Execute Booking and Handle Result
            const bookingResult = await bookingInstance.save();

            if (bookingResult) {
                return res.status(201).json({ 
                    success: true, 
                    message: "Ticket booked successfully",
                    bookingId: bookingResult._id //  Return booking ID
                });
            } else {
                throw new Error("Booking creation failed"); //  Explicitly throw error if save fails
            }

        } catch (bookingError) {
            console.error("Ticket booking error:", bookingError);
            return res.status(500).json({ success: false, message: "Failed to book ticket", error: bookingError.message });
        }
    },

=======
          const { event, user, numberOfTickets, paymentMethodId  } = req.body;
    
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
    
          // Create a new booking record
          const newBooking = new bookingModel({
            user,
            event,
            numberOfTickets,
            totalPrice,
            status: 'confirmed',
          });
          await newBooking.save({ session });


       // Initiate payment with Stripe
       const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100, // convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });
      // Check if payment is successful
      if (paymentIntent.status !== 'succeeded') {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: 'Payment failed' });
      }


          const userInstance = await userModel.findById(user).session(session);
    
          // Generate the QR code for the booking
          const qrData = `Booking ID: ${newBooking._id}\nEvent: ${eventInstance.title}\nUser: ${userInstance.name}`;
          
          // Generate QR code and convert it to a buffer
          QRCode.toBuffer(qrData, { type: 'png' }, async (err, buffer) => {
            if (err) {
              console.error('Error generating QR code:', err);
              return res.status(500).json({ message: 'Error generating QR code' });
            }
           
    
            // Email content
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: userInstance.email, // Send to the user's email
              subject: `Booking Confirmation - ${eventInstance.title}`,
              text: `Dear ${userInstance.name},\n\nYour booking for the event ${eventInstance.title} has been confirmed.\n\nPlease find your QR code below for entry.\n\nThank you for your purchase!`,
              attachments: [
                {
                  filename: 'ticket-qr-code.png',
                  content: buffer, // Attach the QR code image
                },
              ],
            };
    
            // Send the email with the attached QR code
            try {
              await transporter.sendMail(mailOptions);
              console.log('Email sent successfully');
            } catch (err) {
              console.error('Error sending email:', err);
              return res.status(500).json({ message: 'Error sending email' });
            }
    
            await session.commitTransaction();
            session.endSession();
            // Respond to the user with the booking details
            res.status(201).json(newBooking);
          });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error(error);
            res.status(500).json({ message: 'Error booking ticket', error });
            res.status(500).json({ message: 'Error booking ticket', error });
        }
      },

    // Get booking details by ID
>>>>>>> be437dfaaacd141995bc12731d4458fb1146d936
    getBookingDetails: async (req, res) => {
        const { id: bookingId } = req.params;

        // Validation Function (can be extracted further)
        const validateBookingId = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
<<<<<<< HEAD
            if (!validateBookingId(bookingId)) {
                return res.status(400).json({ success: false, message: "Invalid Booking ID format" });
            }

            // Fetch Booking with Event Details
            const bookingRecord = await bookingModel.findById(bookingId)
                .populate('event', 'title date time') //  Example of populating event details
                .exec();

            if (!bookingRecord) {
                return res.status(404).json({ success: false, message: "Booking details not found" });
            }

            return res.status(200).json({ success: true, booking: bookingRecord });

        } catch (fetchError) {
            console.error("Error fetching booking details:", fetchError);
            return res.status(500).json({ success: false, message: "Error retrieving booking details", error: fetchError.message });
        }
    },

    cancelBooking: async (req, res) => {
        const { id: bookingId } = req.params;

        try {
            // 1.  Validate ID
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ success: false, message: "Malformed Booking ID" });
            }

            // 2.  Attempt Cancellation
            const cancellationResult = await bookingModel.findByIdAndDelete(bookingId).exec();

            // 3.  Handle Cancellation Result
            if (cancellationResult) {
                return res.status(200).json({ success: true, message: "Booking successfully cancelled", cancelledBookingId: cancellationResult._id });
            } else {
                return res.status(404).json({ success: false, message: "Booking to cancel not found" });
            }

        } catch (cancelError) {
            console.error("Booking cancellation error:", cancelError);
            return res.status(500).json({ success: false, message: "Error cancelling booking", error: cancelError.message });
        }
    }

};
=======
            const bookingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID' });
            }

            const booking = await bookingModel.findById(bookingId).populate('user event');

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
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
            payment_intent: booking.paymentIntentId, // Assume this ID was saved in the booking model
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

    // Get all bookings (admin or personal)
    getAllBookings: async (req, res) => {
        try {
            const bookings = await bookingModel.find().populate('user event');
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

            const bookings = await bookingModel.find({ user: userId }).populate('event');
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user bookings', error });
        }
    }
};





>>>>>>> be437dfaaacd141995bc12731d4458fb1146d936
module.exports = BookingController;
