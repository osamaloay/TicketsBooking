import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import './EventList.css';

const EventList = ({ events, title, isFeatured = false }) => {
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className={`event-list ${isFeatured ? 'featured' : ''}`}>
      {title && <h2 className="event-list-title">{title}</h2>}
      <div className="event-grid">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventList; 