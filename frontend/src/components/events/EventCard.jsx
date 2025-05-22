import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-image-container">
        <img src={event.image} alt={event.title} className="event-image" />
        {event.availableTickets <= 10 && event.availableTickets > 0 && (
          <div className="ticket-warning">
            Only {event.availableTickets} tickets left!
          </div>
        )}
        {event.availableTickets === 0 && (
          <div className="sold-out-badge">Sold Out</div>
        )}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">{formatDate(event.date)}</p>
        <p className="event-location">{event.location}</p>
        <div className="event-footer">
          <span className="event-price">${event.price}</span>
          <button className="view-details-button">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 