const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/User'); 
const sendEmailROUTE = require('../utils/MFA');
const otpModel = require('../Models/OTP'); 
const crypto = require('crypto');
const dotenv = require('dotenv');
const { register } = require('module');
const { send } = require('process');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenicationController = { 
    register : async (req,res)=> {
        try{
            const {name, email, password, role} = req.body;
            const existUser = await userModel.findOne({email});
            if(existUser){
                return res.status(400).json({message: "User already exists"});
            } 
            await sendEmailROUTE.sendOTP(email);
            
            const hashedPassword = await bycrypt.hash(password, 10);// the 10 is the salt rounds
            const newUser = await userModel.create({
                name,
                email,
                password: hashedPassword,
                role
            });
            
            const token = jwt.sign({id: newUser._id}, SECRET_KEY, {expiresIn: '1h'});
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                },
                token
            });
        }catch(error){

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
        res.status(200).json({
            success: true,
            message: "OTP sent to your email"
        });
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
    const token = jwt.sign({id: user._id}, SECRET_KEY, {expiresIn: '1h'});
    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    });
},
}; 
module.exports = authenicationController;

