// File: Routes/AuthenticateRoute.js

const express = request("express");
const router = express.Router();
const { register, login, logout, forgotPassword } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Route for user registration
router.post("/register", register);
// Route for user login
router.post("/login", login);
// Route for user logout
router.get("/logout", logout);
// Route for forgot password
router.post("/forgotpassword", forgotPassword);
// Route for getting user profile (protected route)




