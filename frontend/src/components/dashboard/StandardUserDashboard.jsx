import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ticketService } from '../../services/ticketService';
import './StandardUserDashboard.css';

const StandardUserDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getUserTickets();
        setTickets(response.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.message || 'Failed to load tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleViewTicketDetails = async (ticketId) => {
    try {
      const ticketDetails = await ticketService.getTicketDetails(ticketId);
      navigate(`/tickets/${ticketId}`, { state: { ticket: ticketDetails } });
    } catch (error) {
      toast.error(error.message || 'Failed to load ticket details');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="standard-user-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Your Tickets</h2>
          {tickets.length === 0 ? (
            <div className="no-tickets">
              <p>You haven't purchased any tickets yet.</p>
              <button 
                className="browse-events-button"
                onClick={() => navigate('/')}
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="ticket-card"
                  onClick={() => handleViewTicketDetails(ticket.id)}
                >
                  <img src={ticket.eventImage} alt={ticket.eventName} />
                  <div className="ticket-info">
                    <h3>{ticket.eventName}</h3>
                    <p className="ticket-date">{ticket.eventDate}</p>
                    <p className="ticket-location">{ticket.eventLocation}</p>
                    <div className="ticket-details">
                      <span className="ticket-quantity">
                        {ticket.quantity} {ticket.quantity === 1 ? 'Ticket' : 'Tickets'}
                      </span>
                      <span className="ticket-price">${ticket.totalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={() => navigate('/profile')}
            >
              Update Profile
            </button>
            <button 
              className="action-button"
              onClick={() => navigate('/')}
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardUserDashboard; 