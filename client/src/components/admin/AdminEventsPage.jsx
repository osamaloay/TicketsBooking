import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import './AdminEventsPage.css';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        try {
            await eventService.updateEvent(eventId, { status: 'approved' });
            await fetchEvents(); // Refresh the events list
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to approve event');
        }
    };

    const handleDecline = async (eventId) => {
        try {
            await eventService.updateEvent(eventId, { status: 'declined' });
            await fetchEvents(); // Refresh the events list
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to decline event');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="admin-events-container">
            <div className="admin-events-header">
                <h2>Manage Events</h2>
            </div>
            <div className="events-grid">
                {events.map(event => (
                    <div key={event._id} className="event-card-wrapper">
                        <div className="event-card">
                            <img src={event.image?.url} alt={event.title} />
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="event-status">
                                Status: <span className={`status-${event.status}`}>{event.status}</span>
                            </div>
                            {event.status === 'pending' && (
                                <div className="event-actions">
                                    <button 
                                        className="approve-btn"
                                        onClick={() => handleApprove(event._id)}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="decline-btn"
                                        onClick={() => handleDecline(event._id)}
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminEventsPage; 