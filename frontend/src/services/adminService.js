import axios from 'axios';
import { API_URL, ENDPOINTS } from '../config';

const adminService = {
  // Get platform-wide statistics
  getStats: async () => {
    try {
      console.log('Making request to:', `${API_URL}${ENDPOINTS.ADMIN.STATS}`);
      console.log('Auth token:', localStorage.getItem('token'));
      
      const response = await axios.get(`${API_URL}${ENDPOINTS.ADMIN.STATS}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Stats API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getStats:', error);
      console.error('Error response:', error.response);
      throw error.response?.data || { message: 'Failed to fetch admin stats' };
    }
  },

  // Get recent users
  getRecentUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      console.log('Making request to:', `${API_URL}/users`);
      
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Users API Response:', response);
      console.log('Users data:', response.data);
      
      if (!response.data) {
        console.warn('No data received from users API');
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  // Get recent events
  getRecentEvents: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/events/recent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recent events' };
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/users`, userData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create user' };
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user details' };
    }
  },

  // Get event details
  getEventDetails: async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch event details' };
    }
  },

  // Generate reports
  generateReport: async (reportType, filters) => {
    try {
      const response = await axios.post(`${API_URL}/admin/reports/${reportType}`, filters, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate report' };
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error.response?.data?.message || 'Failed to delete user';
    }
  }
};

export default adminService; 