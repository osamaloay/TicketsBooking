import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaUser, FaInfoCircle } from 'react-icons/fa';
import { eventService } from '../../services/eventService';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log('Fetching event with ID:', id); // Debug log
        const data = await eventService.getEventDetails(id);
        console.log('Fetched event data:', data); // Debug log
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message || 'Failed to load event details. Please try again later.');
        toast.error(error.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleBuyTicket = () => {
    if (!user) {
      toast.info('Please sign in to purchase tickets');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    navigate(`/events/${id}/purchase`);
  };

  if (loading) {
    return (
      <div className="event-details-loading">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-error">
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-error">
        <p>Event not found</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-header">
        <div className="event-details-image-container">
          <img 
            src={event.image || 'https://via.placeholder.com/800x400'} 
            alt={event.title} 
            className="event-details-image"
          />
        </div>
        <div className="event-details-info">
          <h1>{event.title}</h1>
          <div className="event-details-meta">
            <div className="meta-item">
              <FaCalendarAlt className="icon" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <FaClock className="icon" />
              <span>{new Date(event.date).toLocaleTimeString()}</span>
            </div>
            <div className="meta-item">
              <FaMapMarkerAlt className="icon" />
              <span>{event.location}</span>
            </div>
            <div className="meta-item">
              <FaTicketAlt className="icon" />
              <span>${event.ticketPricing}</span>
            </div>
            <div className="meta-item">
              <FaUser className="icon" />
              <span>{event.organizer?.name || 'Unknown'}</span>
            </div>
          </div>
          <div className="ticket-availability">
            <p className="available-tickets">
              {event.remainingTickets} tickets available
            </p>
            {event.remainingTickets <= 10 && (
              <p className="low-tickets-warning">
                Only {event.remainingTickets} tickets left!
              </p>
            )}
          </div>
          <button 
            className="buy-ticket-button"
            onClick={handleBuyTicket}
            disabled={event.remainingTickets === 0}
          >
            {event.remainingTickets === 0 
              ? 'Sold Out' 
              : user 
                ? 'Buy Tickets' 
                : 'Sign in to Buy Tickets'}
          </button>
        </div>
      </div>

      <div className="event-details-content">
        <section className="event-details-description">
          <h2><FaInfoCircle className="section-icon" /> About the Event</h2>
          <p>{event.description}</p>
        </section>

        <section className="event-details-more-info">
          <h2>Event Details</h2>
          <div className="details-grid">
            <div className="detail-card">
          <h3>Date & Time</h3>
              <p>{new Date(event.date).toLocaleDateString()}</p>
              <p>{new Date(event.date).toLocaleTimeString()}</p>
        </div>
            <div className="detail-card">
          <h3>Location</h3>
          <p>{event.location}</p>
              {event.venue && <p>{event.venue}</p>}
        </div>
            <div className="detail-card">
          <h3>Organizer</h3>
              <p>{event.organizer?.name || 'Unknown'}</p>
              {event.organizer?.email && <p>{event.organizer.email}</p>}
            </div>
        </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetails; 