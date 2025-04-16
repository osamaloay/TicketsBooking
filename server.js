const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./Routes/AuthenticateRoute');
const eventRoutes = require('./Routes/EventRoute');
const userRoutes = require('./Routes/UserRoute');
const bookingRoutes = require('./Routes/BookingRoute');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// All routes under /api/v1
app.use('/api/v1', authRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', bookingRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
