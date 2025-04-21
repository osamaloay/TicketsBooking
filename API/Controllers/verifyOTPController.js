const {hashOTP} = require('../utils/MFA');
const userModel = require('../Models/User');
const otpModel = require('../Models/OTP'); // Assuming you have an OTP model to store OTPs
const dotenv = require('dotenv');
const crypto = require('crypto');
const tempUsers = require('../utils/tempUsersStore');
const bcrypt = require('bcrypt');


const redisClient = require('../utils/redisClient');


const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
dotenv.config();


const verifyOTPController = {
    verifyOTPForRegister: async (req, res) => {
        const { email, otp } = req.body;
        const otpStored = await otpModel.findOne({ email });
        if(!otpStored){
            return res.status(400).json({message: "OTP not found"});
        }
        const hashedOtp = hashOTP(otp);
        if (otpStored.otp !== hashedOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const data = await redisClient.get(`register:${email}`);
        console.log("Data from Redis:", data);
        if (!data) return res.status(400).json({ message: "Session expired or not found" });
        
        const userData = JSON.parse(data);
        const newUser = await userModel.create(userData);
        
        // Clean up
        await redisClient.del(`register:${email}`);
      
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
       
    },
    
    verrifyOTPForLogin: async (req, res) => {
        const { email, otp } = req.body;
        const otpStored = await otpModel.findOne({ email });
        if(!otpStored){
            return res.status(400).json({message: "OTP not found"});
        }
        const hashedOtp = hashOTP(otp);
        if (otpStored.otp !== hashedOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const redisData = await redisClient.get(`login:${email}`);
         if (!redisData) return res.status(400).json({ message: "Session expired" });

       
        const { id } = JSON.parse(redisData);
        const user = await userModel.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });

  await redisClient.del(`login:${email}`);


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

    }, 
    verifyOtpForForgotPassword: async (req, res) => {
        const { email, otp, newPassword } = req.body;
      
        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) return res.status(400).json({ message: "OTP not found or expired" });

        const hashedOtp = hashOTP(otp);
        const isMatch = otpRecord.otp === hashedOtp;
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        const redisData = await redisClient.get(`forgot:${email}`);
        if (!redisData) return res.status(400).json({ message: "Session expired" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.findOneAndUpdate({ email }, { password: hashedPassword });
        await redisClient.del(`forgot:${email}`);
        
      
        res.status(200).json({ message: "Password reset successful" });
      },
    

}; 
module.exports = verifyOTPController;