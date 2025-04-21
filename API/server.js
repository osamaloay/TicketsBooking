
// imports and dependencies
const express = require('express'); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Assuming db.js is in the config folder
const cookieParser = require('cookie-parser');
const EventROUTE = require('./Routes/EventRoute'); 
const BookingROUTE= require('./Routes/BookingRoute'); 
const UserROUTE = require('./Routes/UserRoute'); 
const AuthROUTE = require('./Routes/AuthenticateRoute'); 
const verifyOTPROUTE = require('./Routes/OTPROUTES');




// Connect to MongoDB
connectDB();

const app = express();
dotenv.config();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(cookieParser());
app.use('/tickets', express.static(path.join(__dirname, 'tickets')));



// List of routes 
app.use('/api/v1', AuthROUTE);

app.use('/api/v1/users', UserROUTE);
app.use('/api/v1/events', EventROUTE);
app.use('/api/v1/bookings', BookingROUTE);

app.use('/api/v1/otp', verifyOTPROUTE);



// server port 
const PORT = process.env.PORT || 5000;




 







//start server
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
});
