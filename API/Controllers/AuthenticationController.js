const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/User'); 
const sendEmailROUTE = require('../utils/MFA');
const otpModel = require('../Models/OTP'); 
const crypto = require('crypto');
const dotenv = require('dotenv');
const { register } = require('module');
const { send } = require('process');
const verify = require('../Controllers/verifyOTPController');
const tempUsers = require('../utils/tempUsersStore');
const redisClient = require('../utils/redisClient');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenicationController = { 
    register : async (req,res)=> {
        try {
            const {name, email, password, role} = req.body;
            const existUser = await userModel.findOne({email});
            if(existUser){
                return res.status(400).json({message: "User already exists"});
            } 
            await sendEmailROUTE.sendOTP(email);
            
            const hashedPassword = await bycrypt.hash(password, 10);
            tempUsers.set(email, {
                name,
                password: hashedPassword,
                role,
            });
            
            const tempUser = {
                name,
                email,
                password: hashedPassword,
                role,
            };
            
            // Store in Redis for 5 minutes (300 seconds)
            await redisClient.set(`register:${email}`, JSON.stringify(tempUser), { EX: 300 });
            
            // Add this response
            return res.status(200).json({ 
                message: "Registration successful. Please verify your OTP",
                email: email 
            });
            
        } catch(error) {
            console.error('Registration error:', error);
            return res.status(500).json({ 
                message: "Registration failed",
                error: error.message 
            });
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
        await redisClient.set(`forgot:${email}`, JSON.stringify({ id: user._id }), { EX: 300 });

        res.status(200).json({ message: "OTP sent" });
    
    }catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}, 
    login : async (req,res)=> {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({message: "User not found"});

    }
    const isMatch = await bycrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid credentials"});
    }
    await sendEmailROUTE.sendOTP(email);
    // Store in Redis for 5 minutes (300 seconds)
    await redisClient.set(`login:${email}`, JSON.stringify({ id: user._id }), { EX: 300 });

  res.status(200).json({ message: "OTP sent to email" });
    
    
},
logout : async (req,res)=> {
    res.clearCookie('token');
    res.status(200).json({message: "Logged out successfully"});
    
    
}
}; 
module.exports = authenicationController;

