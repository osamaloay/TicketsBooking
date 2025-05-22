import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import BookTicketForm from './BookTicketForm';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    // Fetch event details
    const fetchEventDetails = async () => {
      try {
        // Add your API call here to fetch event details
        // const response = await eventService.getEventById(id);
        // setEvent(response.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load event details');
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
    setShowBookingForm(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  return (
    <div className="event-details">
      <div className="event-header">
        <img src={event.image} alt={event.title} className="event-image" />
        <div className="event-info">
          <h1>{event.title}</h1>
          <p className="event-date">{event.date}</p>
          <p className="event-location">{event.location}</p>
          <p className="event-price">${event.price}</p>
          <div className="ticket-availability">
            <span className="available-tickets">
              {event.availableTickets} tickets available
            </span>
            {event.availableTickets <= 10 && (
              <span className="low-tickets-warning">
                Only {event.availableTickets} tickets left!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="event-description">
        <h2>About the Event</h2>
        <p>{event.description}</p>
      </div>

      {!showBookingForm ? (
        <div className="event-actions">
          <button 
            className="buy-ticket-button"
            onClick={handleBuyTicket}
            disabled={event.availableTickets === 0}
          >
            {event.availableTickets === 0 
              ? 'Sold Out' 
              : user 
                ? 'Buy Tickets' 
                : 'Sign in to Buy Tickets'}
          </button>
        </div>
      ) : (
        <BookTicketForm 
          event={event}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            toast.success('Tickets purchased successfully!');
            navigate('/dashboard');
          }}
        />
      )}

      {/* Additional event details */}
      <div className="event-details-grid">
        <div className="detail-item">
          <h3>Date & Time</h3>
          <p>{event.date}</p>
          <p>{event.time}</p>
        </div>
        <div className="detail-item">
          <h3>Location</h3>
          <p>{event.location}</p>
          <p>{event.venue}</p>
        </div>
        <div className="detail-item">
          <h3>Organizer</h3>
          <p>{event.organizer}</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 