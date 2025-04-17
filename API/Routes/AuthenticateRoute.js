// File: Routes/AuthenticateRoute.js

const express = require("express");
const router = express.Router();
const authController = require("../Controllers/AuthenticationController");
const  isAuthenticated  = require("../Middleware/authMiddleware");

// Route for user registration
router.post("/register",authController.register);
// Route for user login
router.post("/login", authController.login);
// Route for user logout
//router.get("/logout", authController.logout);
// Route for forgot password
router.post("/forgotpassword", authController.forgotPassword);
// Route for getting user profile (protected route)

module.exports = router;


