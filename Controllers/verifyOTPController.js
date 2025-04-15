const {hashOTP} = require('../utils/MFA');
const userModel = require('../Models/User');
const otpModel = require('../Models/OTP'); // Assuming you have an OTP model to store OTPs
const dotenv = require('dotenv');
const crypto = require('crypto');

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
        await otpModel.deleteMany({ email }); // Delete the OTP after verification
        return res.status(200).json({ message: "OTP verified successfully" });
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
        await otpModel.deleteMany({ email }); // Delete the OTP after verification
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({
            message: "OTP verified successfully",
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
      
        const otpRecord = await OtpModel.findOne({ email });
        if (!otpRecord) return res.status(400).json({ message: "OTP not found or expired" });
      
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });
      
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.findOneAndUpdate({ email }, { password: hashedPassword });
        await OtpModel.deleteMany({ email });
      
        res.status(200).json({ message: "Password reset successful" });
      },
    

}; 
module.exports = verifyOTPController;