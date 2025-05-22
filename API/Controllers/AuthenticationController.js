const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/User'); 
const sendEmailROUTE = require('../utils/MFA');
const otpModel = require('../Models/OTP'); 
const crypto = require('crypto');
const dotenv = require('dotenv');
const tempUsers = require('../utils/tempUsersStore');
const tempStorage = require('../utils/tempStorage');
// Comment out Redis
// const redisClient = require('../utils/redisClient');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenicationController = { 
    register : async (req,res)=> {
        try{
            const {name, email, password, role} = req.body;
            
            // Validate required fields
            if (!name || !email || !password || !role) {
                return res.status(400).json({message: "All fields are required"});
            }

            // Validate role
            const validRoles = ['Standard User', 'Organizer', 'System Admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({message: "Invalid role"});
            }

            const existUser = await userModel.findOne({email});
            if(existUser){
                return res.status(400).json({message: "User already exists"});
            } 
            
            await sendEmailROUTE.sendOTP(email);
           
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const tempUser = {
                name,
                email,
                password: hashedPassword,
                role,
            };
              
            // Store in tempStorage
            tempStorage.set(`register:${email}`, tempUser);
            console.log('Stored user data in tempStorage:', tempUser);
            
            res.status(200).json({ message: "OTP sent" });
              
        }catch(error){
            console.error('Error in register:', error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    forgotPassword : async (req,res)=> {
        try {
            const {email} = req.body;
            const user = await userModel.findOne({email});
            if(!user){
                return res.status(400).json({message: "User not found"});
            }
            
            await sendEmailROUTE.sendOTP(email);
            
            // Comment out Redis storage
            // await redisClient.set(`forgot:${email}`, JSON.stringify({ id: user._id }));
            
            // New code using tempStorage
            tempStorage.set(`forgot:${email}`, { id: user._id });

            res.status(200).json({ message: "OTP sent" });
    
        }catch(error){
            console.error('Error in forgotPassword:', error);
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message
            });
        }
    },
    login : async (req,res)=> {
        try {
            const {email, password} = req.body;
            const user = await userModel.findOne({email});
            if(!user){
                return res.status(400).json({message: "User not found"});
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({message: "Invalid credentials"});
            }
            await sendEmailROUTE.sendOTP(email);
            
            // Comment out Redis storage
            // await redisClient.set(`login:${email}`, JSON.stringify({ id: user._id }));
            
            // New code using tempStorage
            tempStorage.set(`login:${email}`, { id: user._id });

            res.status(200).json({ message: "OTP sent to email" });
        } catch(error) {
            console.error('Error in login:', error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
}; 

// Export both the controller and the tempStorage
module.exports = {
    ...authenicationController,
    tempStorage
};

