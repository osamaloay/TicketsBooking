import axios from 'axios';
import { API_URL, ENDPOINTS } from '../config';

export const authService = {
  async register(userData) {
    try {
      console.log('Sending registration request:', userData);
      const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async verifyRegistrationOTP(email, otp) {
    try {
      const response = await fetch(`${API_URL}/otp/verify/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async login(credentials) {
    try {
      console.log('Sending login request:', credentials);
      const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.message || !data.message.includes('OTP sent')) {
        throw new Error('OTP not sent. Please try again.');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  async verifyLoginOTP(email, otp) {
    try {
      console.log('Verifying login OTP:', { email, otp });
      const response = await fetch(`${API_URL}/otp/verify/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log('Full OTP verification response:', data);
      console.log('User data from response:', data.user);
      console.log('User role:', data.user?.role);

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      if (!data.user || !data.user.role) {
        console.error('No user data or role in response:', data);
        throw new Error('Invalid user data received from server');
      }

      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async updateProfile(userData, token) {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Profile update failed. Please try again.');
    }
  },

  async forgotPassword(email) {
    try {
      console.log('Sending forgot password request for email:', email);
      const response = await fetch(`${API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process forgot password request');
      }

      const data = await response.json();
      console.log('Forgot password response:', data);
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async verifyForgotPasswordOTP(email, otp) {
    try {
      const response = await fetch(`${API_URL}/auth/verify-forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async resetPassword(email, otp, newPassword) {
    try {
      console.log('Resetting password:', { email, otp });
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const data = await response.json();
      console.log('Reset password response:', data);
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getProfile(token) {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async sendOTP(email) {
    try {
      console.log('Sending OTP request for email:', email);
      const response = await fetch(`${API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      const data = await response.json();
      console.log('Send OTP response:', data);
      return data;
    } catch (error) {
      console.error('Send OTP error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async verifyOTP(email, otp) {
    try {
      console.log('Verifying OTP:', { email, otp });
      const response = await fetch(`${API_URL}/otp/verify/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify OTP');
      }

      const data = await response.json();
      console.log('Verify OTP response:', data);
      return data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },
}; 