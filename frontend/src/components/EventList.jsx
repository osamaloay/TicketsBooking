 import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import EventCard from './EventCard';
import './EventList.css';  // make sure this file exists or remove this line

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getApprovedEvents()
      .then(data => {
        console.log('Fetched events:', data);
        setEvents(data);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events…</p>;
  if (!events.length) return <p>No events found.</p>;

  return (
    <div className="event-grid">
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
