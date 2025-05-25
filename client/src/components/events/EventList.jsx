// client/src/components/events/EventList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';


const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('/api/events');
                setEvents(response.data);
            } catch (err) {
                setError('Failed to load events');
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="events-grid">
            {events.map(event => (
                <Link to={`/events/${event._id}`} key={event._id}>
                    <div className="event-card">
                        <img src={event.image} alt={event.title} />
                        <div className="event-info">
                            <h3>{event.title}</h3>
                            <p>{new Date(event.date).toLocaleDateString()}</p>
                            <p>{event.location}</p>
                            <p>${event.price}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default EventList;