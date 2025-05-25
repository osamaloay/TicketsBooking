// client/src/components/events/EventList.jsx
import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

const EventList = () => {
    const { 
        events, 
        loading, 
        error, 
        fetchEvents 
    } = useEvent();

    // Use useCallback to memoize the fetchEvents call
    const loadEvents = useCallback(async () => {
        if (events.length === 0) {
            await fetchEvents();
        }
    }, [events.length, fetchEvents]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Show loading spinner only when we have no events and are loading
    if (loading && events.length === 0) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!events || events.length === 0) {
        return <div>No events found</div>;
    }

    return (
        <div className="events-grid">
            {events.map(event => (
                <Link to={`/events/${event._id}`} key={event._id}>
                    <div className="event-card">
                        <img 
                            src={event.image || '/default-event-image.jpg'} 
                            alt={event.title} 
                        />
                        <div className="event-info">
                            <h3>{event.title}</h3>
                            <p>{new Date(event.date).toLocaleDateString()}</p>
                            <p>{event.location}</p>
                            <p>${event.ticketPricing}</p>
                            <p>Available: {event.remainingTickets}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default EventList;