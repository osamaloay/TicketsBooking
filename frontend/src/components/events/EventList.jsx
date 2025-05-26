import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';
import { eventService } from '../../services/eventService';
import './EventList.css';

/**
 * Fetches and displays a grid of approved events.
 */
export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await eventService.getApprovedEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loader">Loading events…</div>;
  if (!events.length) return <p className="no-events">No events available.</p>;

  return (
    <div className="event-grid">
      {events.map(evt => (
        <EventCard key={evt._id} event={evt} />
      ))}
    </div>
  );
}