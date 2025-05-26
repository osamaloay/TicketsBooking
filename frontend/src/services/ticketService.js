import { API_URL } from '../config';

export const ticketService = {
  async getUserTickets() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/tickets/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { data: [] }; // Return empty array if no tickets found
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tickets');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user tickets error:', error);
      throw error;
    }
  },

  async getTicketDetails(ticketId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch ticket details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get ticket details error:', error);
      throw error;
    }
  },

  async purchaseTicket(eventId, quantity) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ eventId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to purchase ticket');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Purchase ticket error:', error);
      throw error;
    }
  },

  async cancelTicket(ticketId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/tickets/${ticketId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel ticket');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cancel ticket error:', error);
      throw error;
    }
  },
}; 