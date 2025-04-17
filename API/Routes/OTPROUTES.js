const express = require('express');
const router = express.Router();
const verifyOTPController = require('../Controllers/verifyOTPController');

router.post('/verify/register', verifyOTPController.verifyOTPForRegister);
router.post('/verify/login', verifyOTPController.verrifyOTPForLogin);
router.post('/verify/forgot', verifyOTPController.verifyOtpForForgotPassword);


module.exports = router;
