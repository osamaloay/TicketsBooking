import React, { useEffect, useState } from 'react';
import EventList from '../components/events/EventList';
import { eventService } from '../services/eventService';

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getApprovedEvents()
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading events…</div>;
  if (!events.length) return <div>No events found.</div>;

  return (
    <div>
      <h1>Browse Events</h1>
      <EventList events={events} />
    </div>
  );
}
