import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import './FeaturedEvents.css';

const FeaturedEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getApprovedEvents();
        
        if (Array.isArray(data)) {
          // Filter approved events and limit to 3
          const featuredEvents = data
            .filter(event => event.status === 'approved')
            .slice(0, 3);
          setEvents(featuredEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching featured events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="featured-events-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="featured-events-error">
        <p>Unable to load featured events. Please try again later.</p>
      </div>
    );
  }

  return (
    <section className="featured-events">
      <div className="featured-events-container">
        <h2>Featured Events</h2>
        <div className="featured-events-grid">
          {events.map((event) => (
            <div 
              key={event._id} 
              className="featured-event-card"
              onClick={() => handleEventClick(event._id)}
            >
              <div className="featured-event-image">
                <img 
                  src={event.image || 'https://via.placeholder.com/300x200'} 
                  alt={event.title} 
                />
              </div>
              <div className="featured-event-info">
                <h3>{event.title}</h3>
                <p className="featured-event-date">
                  <i className="fas fa-calendar-alt"></i>
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="featured-event-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {event.location}
                </p>
                <p className="featured-event-price">
                  <i className="fas fa-ticket-alt"></i>
                  ${event.ticketPrice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents; 