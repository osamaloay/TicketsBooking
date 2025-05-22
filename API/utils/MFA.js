const nodeMailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const otpModel = require('../Models/OTP'); // Assuming you have an OTP model to store OTPs
dotenv.config();


const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}
const hashOTP = (otp) => {
    const hash = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    return hash;
}
const sendOTP = async (email)=> { 
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    await otpModel.deleteMany({email: email}); // Delete any existing OTP for the email
    const newOtp = await otpModel.create({
        email,
        otp: hashedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000 // OTP valid for 5 minutes
    });

    const transporter = nodeMailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        },
    });

    const mailOptions = { 
        from : `TicketNest <${process.env.EMAIL_USER}>`,
        to : email,
        subject : 'Your OTP for MFA',
        text : `Your OTP is ${otp}. It is valid for 5 minutes.`
    };
    await transporter.sendMail(mailOptions, (error,info)=> { 
        if(error){
            console.log('Error sending email:', error);
        }else{
            console.log('Email sent:', info.response);
        }
    });
}
module.exports = {sendOTP,hashOTP} ;

