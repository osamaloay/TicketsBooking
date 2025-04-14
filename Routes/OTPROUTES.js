const express = require('express');
const router = express.Router();
const verifyOTPController = require('./Controllers/verifyOTPController');

router.post('/verify/register', verifyOTPController.verifyOtpForRegister);
router.post('/verify/login', verifyOTPController.verifyOtpForLogin);
router.post('/verify/forgot', verifyOTPController.verifyOtpForForgotPassword);


module.exports = router;
