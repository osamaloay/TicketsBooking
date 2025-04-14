const bookingModel = require('../Models/BookingModel');
const mongoose = require('mongoose');


const BookingController = {
    getAllBookings: async (req, res) => {
        try {
            const bookings = await bookingModel.find();
            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching bookings', error });
        }
    }
    ,} ;
