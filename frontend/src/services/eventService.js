import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const eventService = {
  // Get all approved events (public)
  getAllEvents: async () => {
    try {
      console.log('Fetching all events...');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/events/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('All events response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw new Error(error.response?.data?.message || 'Error fetching events');
    }
  },

  // Get event details
  getEventDetails: async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching event details');
    }
  },

  // Create new event (organizer only)
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(
        `${API_URL}/events`,
        eventData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating event');
    }
  },

  // Get organizer's events
  getOrganizerEvents: async () => {
    try {
      console.log('Starting getOrganizerEvents...'); // Debug log
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token); // Debug log

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/events/organizer/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response data:', response.data); // Debug log

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('Error in getOrganizerEvents:', error); // Debug log
      if (error.response) {
        console.error('Error response:', error.response.data); // Debug log
        if (error.response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          throw new Error('Session expired. Please login again');
        }
        if (error.response.status === 403) {
          throw new Error('Access denied: You are not authorized to view these events');
        }
        throw new Error(error.response.data.message || 'Error fetching organizer events');
      }
      throw new Error(error.message || 'Error fetching organizer events');
    }
  },

  // Get pending events (admin only)
  getPendingEvents: async () => {
    try {
      console.log('Fetching pending events...');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/events/pending`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Pending events response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending events:', error);
      throw new Error(error.response?.data?.message || 'Error fetching pending events');
    }
  },

  // Approve event (admin only)
  approveEvent: async (eventId) => {
    try {
      console.log('Approving event:', eventId); // Debug log
      const response = await axios.put(
        `${API_URL}/events/${eventId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      console.log('Approve response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error approving event:', error); // Debug log
      throw new Error(error.response?.data?.message || 'Error approving event');
    }
  },

  // Reject event (admin only)
  rejectEvent: async (eventId, rejectionReason) => {
    try {
      console.log('Rejecting event:', eventId, 'with reason:', rejectionReason); // Debug log
      const response = await axios.put(
        `${API_URL}/events/${eventId}/reject`,
        { rejectionReason },
        { headers: getAuthHeader() }
      );
      console.log('Reject response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error rejecting event:', error); // Debug log
      throw new Error(error.response?.data?.message || 'Error rejecting event');
    }
  },

  async getEventById(eventId) {
    try {
      console.log('Fetching event details for ID:', eventId); // Debug log
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to fetch event details');
      }

      const data = await response.json();
      console.log('Fetched event data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error in getEventById:', error);
      throw error;
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      console.log('Updating event:', eventId, eventData); // Debug log
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      console.log('Update response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to update event');
      }

      const data = await response.json();
      console.log('Updated event data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  },

  async deleteEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  async getEventAnalytics(eventId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/events/${eventId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch event analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get event analytics error:', error);
      throw error;
    }
  },

  updateEventStatus: async (eventId, status) => {
    try {
      console.log('Updating event status:', { eventId, status });
      const response = await axios.put(
        `${API_URL}/events/${eventId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Event status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error.response?.data || error.message;
    }
  },

  async getUserEventsAnalytics() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/users/events/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      throw error.response?.data?.message || 'Failed to fetch event analytics';
    }
  }
};

export { eventService }; 