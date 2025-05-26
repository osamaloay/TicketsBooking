import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './EventCard.css';

/**
 * Displays a summary card for a single event.
 * Clicking navigates to the event details page.
 */
export default function EventCard({ event }) {
  const navigate = useNavigate();
  const {
    _id,
    title,
    date,
    location,
    ticketPricing,
    remainingTickets,
  } = event;

  return (
    <div
      className="event-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/events/${_id}`)}
      onKeyPress={() => navigate(`/events/${_id}`)}
    >
      <h3>{title}</h3>
      <p className="event-date">{new Date(date).toLocaleDateString()}</p>
      <p className="event-location">{location}</p>
      <p className="event-price">Price: {ticketPricing.toLocaleString()} EGP</p>
      <p className="event-remaining">
        {remainingTickets > 0
          ? `${remainingTickets} tickets left`
          : 'Sold Out'}
      </p>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    ticketPricing: PropTypes.number.isRequired,
    remainingTickets: PropTypes.number.isRequired,
  }).isRequired,
};