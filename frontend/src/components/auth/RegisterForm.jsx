import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import './AuthForms.css';

const RegisterForm = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Standard User'
  });

  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // if user missed any 
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Format the registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      console.log('Submitting registration data:', registrationData);
      const response = await register(registrationData);
      console.log('Registration response:', response);
      
      if (response && response.message === 'OTP sent') {
        setShowOTP(true);
        toast.success('OTP sent to your email!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Registration error in form:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Cannot connect to the server. Please check if the server is running.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Verifying OTP for email:', formData.email);
      const response = await authService.verifyRegistrationOTP(formData.email, otp);
      console.log('OTP verification response:', response);
      
      if (response && (response.message === 'Registration successful' || response.token)) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('OTP verification error in form:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Cannot connect to the server. Please check if the server is running.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h2>Create Account</h2>
          <p>Join our community today</p>
        </div>

        {!showOTP ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group"> 
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                className={`form-control ${errors.role ? 'error' : ''}`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Standard User">Standard User</option>
                <option value="Organizer">Organizer</option>
                <option value="System Admin">System Admin</option>
              </select>
              {errors.role && <div className="error-message">{errors.role}</div>}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading && <span className="loading-spinner"></span>}
              Create Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPVerification}>
            <div className="form-group">
              <label>Enter OTP</label>
              <div className="otp-input-container">
                <input
                  type="text"
                  maxLength="6"
                  className="otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading && <span className="loading-spinner"></span>}
              Verify OTP
            </button>
          </form>
        )}

        <div className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 