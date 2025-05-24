import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const bookingService = {
  // Get all bookings for the current user
  getUserBookings: async () => {
    try {
      console.log('Fetching user bookings...');
      const response = await axios.get(`${API_URL}/api/v1/bookings/user`, {
        headers: getAuthHeader()
      });
      console.log('User bookings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      // Log the incoming booking data
      console.log('Received booking data:', bookingData);

      // Validate booking data
      if (!bookingData.eventId || !bookingData.quantity || !bookingData.totalAmount) {
        console.error('Missing required fields:', {
          eventId: bookingData.eventId,
          quantity: bookingData.quantity,
          totalAmount: bookingData.totalAmount
        });
        throw new Error('Missing required booking information');
      }

      // Format the booking data according to backend expectations
      const formattedBookingData = {
        eventId: bookingData.eventId,
        quantity: parseInt(bookingData.quantity),
        totalAmount: parseFloat(bookingData.totalAmount),
        userId: bookingData.userId,
        eventTitle: bookingData.eventTitle,
        eventDate: bookingData.eventDate,
        eventLocation: bookingData.eventLocation,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
      };

      console.log('Creating booking with formatted data:', formattedBookingData);
      console.log('API URL:', `${API_URL}/api/v1/bookings`);
      
      // Make the API call
      const response = await axios.post(`${API_URL}/api/v1/bookings`, formattedBookingData, {
        headers: getAuthHeader()
      });

      if (!response.data) {
        console.error('No response data received');
        throw new Error('No response data received from server');
      }

      console.log('Booking creation successful:', response.data);
      return response.data;
    } catch (error) {
      // Log detailed error information
      console.error('Booking error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Handle specific error cases
      if (!error.response) {
        console.error('Network error - no response received');
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      switch (error.response.status) {
        case 401:
          throw new Error('Please log in to make a booking');
        case 400:
          throw new Error(error.response.data.message || 'Invalid booking data. Please check your input.');
        case 404:
          throw new Error('Booking service not found. Please try again later.');
        case 500:
          console.error('Server error details:', error.response.data);
          throw new Error(error.response.data.message || 'Server error. Please try again later or contact support.');
        default:
          throw new Error(error.response.data?.message || 'Failed to create booking. Please try again.');
      }
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      console.log('Cancelling booking:', bookingId);
      const response = await axios.delete(
        `${API_URL}/api/v1/bookings/${bookingId}`,
        { headers: getAuthHeader() }
      );
      console.log('Booking cancellation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      console.log('Fetching booking details:', bookingId);
      const response = await axios.get(`${API_URL}/api/v1/bookings/${bookingId}`, {
        headers: getAuthHeader()
      });
      console.log('Booking details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
    }
  }
}; 