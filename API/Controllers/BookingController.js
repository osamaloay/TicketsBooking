const bookingModel = require('../Models/Booking');
const mongoose = require('mongoose');


const BookingController = {
    bookTicket: async (req, res) => {
        try {
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

    getBookingDetails: async (req, res) => {
        const { id: bookingId } = req.params;

        // Validation Function (can be extracted further)
        const validateBookingId = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
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
module.exports = BookingController;
