import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import { toast } from 'react-toastify';
import EventCard from '../events/EventCard';
import './AdminEventsPage.css';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'approved', 'pending', 'declined'

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (eventId, newStatus) => {
        try {
            await eventService.updateEvent(eventId, { status: newStatus });
            toast.success(`Event ${newStatus} successfully`);
            fetchEvents(); // Refresh the events list
        } catch (error) {
            console.error('Error updating event status:', error);
            toast.error('Failed to update event status');
        }
    };

    const filteredEvents = events.filter(event => {
        if (filter === 'all') return true;
        return event.status === filter;
    });

    if (loading) {
        return (
            <div className="admin-events-loading">
                <div className="loading-spinner"></div>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="admin-events-container">
            <div className="admin-events-header">
                <h2>Event Management</h2>
                <div className="filter-controls">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Events
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'declined' ? 'active' : ''}`}
                        onClick={() => setFilter('declined')}
                    >
                        Declined
                    </button>
                </div>
            </div>

            <div className="events-grid">
                {filteredEvents.map(event => (
                    <div key={event._id} className="event-card-wrapper">
                        <EventCard event={event} />
                        {event.status === 'pending' && (
                            <div className="event-actions">
                                <button 
                                    className="approve-btn"
                                    onClick={() => handleStatusUpdate(event._id, 'approved')}
                                >
                                    Approve
                                </button>
                                <button 
                                    className="decline-btn"
                                    onClick={() => handleStatusUpdate(event._id, 'declined')}
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="no-events">
                    <p>No events found in this category</p>
                </div>
            )}
        </div>
    );
};

export default AdminEventsPage; 