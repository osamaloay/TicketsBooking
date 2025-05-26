const {hashOTP} = require('../utils/MFA');
const userModel = require('../Models/User');
const otpModel = require('../Models/OTP'); // Assuming you have an OTP model to store OTPs
const dotenv = require('dotenv');
const crypto = require('crypto');
const tempUsers = require('../utils/tempUsersStore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tempStorage = require('../utils/tempStorage');
const SECRET_KEY = process.env.SECRET_KEY;
dotenv.config();

const verifyOTPController = {
    verifyOTPForRegister: async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log('Received OTP verification request:', { email, otp });

            if (!email || !otp) {
                console.log('Missing email or OTP in request');
                return res.status(400).json({ message: "Email and OTP are required" });
            }

            const otpStored = await otpModel.findOne({ email });
            console.log('Found OTP in database:', otpStored ? 'Yes' : 'No');
            
            if(!otpStored) {
                console.log('No OTP found for email:', email);
                return res.status(400).json({message: "OTP not found or expired"});
            }

            const hashedOtp = hashOTP(otp);
            console.log('Comparing OTPs:', { 
                received: hashedOtp, 
                stored: otpStored.otp,
                match: otpStored.otp === hashedOtp
            });

            if (otpStored.otp !== hashedOtp) {
                console.log('Invalid OTP');
                return res.status(400).json({ message: "Invalid OTP" });
            }

            const data = tempStorage.get(`register:${email}`);
            console.log("Data from tempStorage:", data);
            if (!data) {
                console.log('No registration data found in tempStorage');
                return res.status(400).json({ message: "Session expired or not found" });
            }

            const userData = data;
            console.log('Creating user with data:', userData);
            const newUser = await userModel.create(userData);
            console.log('User created successfully:', newUser);
            
            // Clean up
            tempStorage.delete(`register:${email}`);
            await otpModel.deleteOne({ email });
        
            const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: '1h' });
        
            // Cleanup
            tempUsers.delete(email);
        
            return res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            console.error('Error in verifyOTPForRegister:', error);
            return res.status(500).json({ 
                message: "Server error", 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },
    
    verrifyOTPForLogin: async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log('Received login OTP verification request:', { email, otp });

            const otpStored = await otpModel.findOne({ email });
            if(!otpStored) {
                console.log('No OTP found for email:', email);
                return res.status(400).json({message: "OTP not found"});
            }

            const hashedOtp = hashOTP(otp);
            console.log('Comparing OTPs:', { 
                received: hashedOtp, 
                stored: otpStored.otp 
            });

            if (otpStored.otp !== hashedOtp) {
                console.log('Invalid OTP');
                return res.status(400).json({ message: "Invalid OTP" });
            }

            const data = tempStorage.get(`login:${email}`);
            console.log('Login data from tempStorage:', data);
            if (!data) {
                console.log('No login data found in tempStorage');
                return res.status(400).json({ message: "Session expired" });
            }

            const { id } = data;
            const user = await userModel.findOne({ _id: id });
            if (!user) {
                console.log('User not found:', id);
                return res.status(404).json({ message: "User not found" });
            }

            const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });

            // Clean up
            tempStorage.delete(`login:${email}`);
            await otpModel.deleteOne({ email });

            res.status(200).json({
                message: "Logged in successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error in verifyOTPForLogin:', error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    
    verifyOtpForForgotPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            console.log('Received forgot password OTP verification request:', { email, otp });
      
            const otpRecord = await otpModel.findOne({ email });
            if (!otpRecord) {
                console.log('No OTP found for email:', email);
                return res.status(400).json({ message: "OTP not found or expired" });
            }

            const hashedOtp = hashOTP(otp);
            console.log('Comparing OTPs:', { 
                received: hashedOtp, 
                stored: otpRecord.otp 
            });

            const isMatch = otpRecord.otp === hashedOtp;
            if (!isMatch) {
                console.log('Invalid OTP');
                return res.status(400).json({ message: "Invalid OTP" });
            }

            const data = tempStorage.get(`forgot:${email}`);
            console.log('Forgot password data from tempStorage:', data);
            if (!data) {
                console.log('No forgot password data found in tempStorage');
                return res.status(400).json({ message: "Session expired" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userModel.findOneAndUpdate({ email }, { password: hashedPassword });
            
            // Clean up
            tempStorage.delete(`forgot:${email}`);
            await otpModel.deleteOne({ email });
      
            res.status(200).json({ message: "Password reset successful" });
        } catch (error) {
            console.error('Error in verifyOtpForForgotPassword:', error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}; 

module.exports = verifyOTPController;