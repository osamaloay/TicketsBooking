const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
// Register user
const registerUser = async (req, res) => {
    console.log("Register route hit!");
    const { name, email, password, role } = req.body;
    console.log('Registering user:', { email, role });
  
    try {
      const userExists = await User.findOne({ email });
      //already exists or not
      if (userExists) {
        console.log('User already exists');
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create user - password will be hashed by the model's pre-save hook
      const user = new User({
        name,
        email,
        password, // Pass the plain password - model will hash it
        role,
      });
  
      const savedUser = await user.save();
      console.log('User saved successfully:', savedUser);
  
      //generate token
      res.status(201).json({
        token: generateToken(savedUser._id, savedUser.role),
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        }
      });
    } catch (error) {
      console.error('Registration Error:', error); 
      res.status(500).json({ message: 'Server Error' });
    }
};
// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use the model's matchPassword method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', { email, role: user.role });
    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', { email, error: error.message });
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// Update profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
// Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  forgetPassword
};

