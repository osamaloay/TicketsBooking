// client/src/components/events/EventList.jsx
import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUsers } from 'react-icons/fa';
import './EventList.css';

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
        return (
            <div className="no-events">
                <h2>No Events Found</h2>
                <p>Check back later for exciting events!</p>
            </div>
        );
    }

    return (
        <div className="events-container">
            <div className="events-header">
                <h2>
                    <span className="emoji">🎉</span>
                    Upcoming Events
                    <span className="emoji">🎪</span>
                </h2>
                <p>Discover and book tickets for the most exciting events in town</p>
            </div>
            
            <div className="events-grid">
                {events.map(event => (
                    <Link to={`/events/${event._id}`} key={event._id} className="event-link">
                        <div className="event-card">
                            <div className="event-image-container">
                                <img 
                                    src={event.image?.url || '/default-event-image.jpg'} 
                                    alt={event.title}
                                    className="event-image"
                                />
                            </div>
                            
                            <div className="event-info">
                                <h3 className="event-title">{event.title}</h3>
                                
                                <div className="event-details">
                                    <div className="event-detail">
                                        <FaCalendarAlt className="icon" />
                                        <span>{new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                    
                                    <div className="event-detail">
                                        <FaMapMarkerAlt className="icon" />
                                        <span>{event.location.address || 'Location not specified'}</span>
                                    </div>
                                    
                                    <div className="event-detail">
                                        <FaTicketAlt className="icon" />
                                        <span>${event.ticketPricing}</span>
                                    </div>
                                    
                                    <div className="event-detail">
                                        <FaUsers className="icon" />
                                        <span className={event.remainingTickets > 0 ? 'available-label' : 'sold-out-label'}>
                                            {event.remainingTickets} tickets left
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="event-footer">
                                    <span className="event-status">
                                        {event.remainingTickets > 0 ? 'Available' : 'Sold Out'}
                                    </span>
                                    <button className="view-details-btn">View Details</button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="discover-events">
                <h2>
                    <span className="emoji">🔍</span>
                    Discover Events
                    <span className="emoji">✨</span>
                </h2>
                <p>Find your next unforgettable experience</p>
            </div>
        </div>
    );
};

export default EventList;