import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '../../services/eventService';
import './EventCompleteDet.css';

const EventCompleteDet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch event details');
        toast.error(err.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  const handlePurchaseClick = () => {
    navigate(`/purchase-tickets/${id}`);
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="event-complete-details">
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-category">{event.category}</div>
      </div>

      <div className="event-content">
        <div className="event-image-container">
          <img 
            src={event.image} 
            alt={event.title} 
            className="event-image"
          />
        </div>

        <div className="event-info">
          <div className="info-section">
            <h2>Event Details</h2>
            <p className="description">{event.description}</p>
          </div>

          <div className="info-section">
            <h2>Date & Time</h2>
            <p>{formatDate(event.date)}</p>
          </div>

          <div className="info-section">
            <h2>Location</h2>
            <p>{event.location}</p>
          </div>

          <div className="info-section">
            <h2>Ticket Information</h2>
            <div className="ticket-info">
              <p>Price: ${event.ticketPrice}</p>
              <p>Available Tickets: {event.remainingTickets}</p>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="purchase-button"
              onClick={handlePurchaseClick}
              disabled={event.remainingTickets === 0}
            >
              {event.remainingTickets === 0 ? 'Sold Out' : 'Purchase Tickets'}
            </button>
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCompleteDet;