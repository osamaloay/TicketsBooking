const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const  express = require('express');
const x = require('bcrypt');

const db_uri = process.env.MONGO_URI;
if (!db_uri) {
    console.error('DB_URI is not defined in .env file');
    process.exit(1);
}


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
module.exports = connectDB;