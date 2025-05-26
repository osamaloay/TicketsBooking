import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import './EventDetails.css';

/**
 * Displays detailed information for a single event.
 */
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await eventService.getEventDetails(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="loader">Loading event…</div>;
  if (!event) return <p className="error">Event not found.</p>;

  const {
    title,
    description,
    date,
    location,
    ticketPricing,
    remainingTickets,
  } = event;

  return (
    <div className="event-details-container">
      <h2>{title}</h2>
      <p className="description">{description}</p>
      <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Tickets Left:</strong> {remainingTickets}</p>
      <p><strong>Price:</strong> {ticketPricing} EGP</p>
      {remainingTickets > 0 ? (
        <button onClick={() => navigate(`/events/${id}/purchase`)}>
          Book Now
        </button>
      ) : (
        <span className="sold-out">Sold Out</span>
      )}
    </div>
  );
}