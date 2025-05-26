import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaDollarSign } from 'react-icons/fa';
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

    const handleStatusChange = async (eventId, newStatus, eventTitle) => {
        try {
            await eventService.updateEvent(eventId, { status: newStatus });
            await fetchEvents(); // Refresh the events list
            toast.success(`Event "${eventTitle}" status updated to ${newStatus}`);
            setError(null);
        } catch (err) {
            toast.error(err.message || `Failed to update event status to ${newStatus}`);
            setError(err.message || `Failed to update event status to ${newStatus}`);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
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
                            <div className="event-image">
                                {event.image?.url ? (
                                    <img src={event.image.url} alt={event.title} />
                                ) : (
                                    <div className="no-image">
                                        <FaCalendarAlt />
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div className="event-status">
                                    <span className={`status-badge status-${event.status}`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                            <div className="event-details">
                                <h3>{event.title}</h3>
                                <div className="event-info">
                                    <div className="info-item">
                                        <FaCalendarAlt />
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaMapMarkerAlt />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaUsers />
                                        <span>{event.totalTickets} tickets</span>
                                    </div>
                                    <div className="info-item">
                                        <FaDollarSign />
                                        <span>${event.ticketPricing}</span>
                                    </div>
                                </div>
                                <div className="event-description">
                                    <p>{event.description}</p>
                                </div>
                                <div className="event-actions">
                                    <select 
                                        value={event.status}
                                        onChange={(e) => handleStatusChange(event._id, e.target.value, event.title)}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminEventsPage; 