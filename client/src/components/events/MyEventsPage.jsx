import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, eventService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EventForm from './EventForm';
import './MyEventsPage.css';

const MyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const response = await userService.getOrganizerEvents();
            setEvents(response);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEdit = (event) => {
        navigate(`/my-events/edit/${event._id}`);
    };

    const handleDelete = async (eventId, e) => {
        e.stopPropagation(); // Prevent card click when clicking delete
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventService.deleteEventById(eventId);
                toast.success('Event deleted successfully');
                fetchEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                toast.error('Failed to delete event');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedEvent(null);
        fetchEvents();
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'status-approved';
            case 'pending':
                return 'status-pending';
            case 'declined':
                return 'status-declined';
            default:
                return '';
        }
    };

    if (loading) {
        return <div className="events-loading">Loading events...</div>;
    }

    return (
        <div className="my-events-container">
            <div className="events-header">
                <h2>My Events</h2>
                <button className="create-event-button" onClick={() => navigate('/my-events/new')}>
                    <FaPlus /> Create New Event
                </button>
            </div>

            <div className="events-grid">
                {events.map((event) => (
                    <div 
                        key={event._id} 
                        className="event-card"
                        onClick={() => handleEdit(event)}
                    >
                        <div className="event-image">
                            {event.image ? (
                                <img src={event.image.url} alt={event.title} />
                            ) : (
                                <div className="no-image">No Image</div>
                            )}
                        </div>
                        <div className="event-details">
                            <h3>{event.title}</h3>
                            <p className="event-date">
                                {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p className="event-location">{event.location}</p>
                            <div className="event-stats">
                                <span>Tickets: {event.totalTickets}</span>
                                <span>Price: ${event.ticketPricing}</span>
                            </div>
                            <div className="event-status">
                                <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
                                    {event.status}
                                </span>
                            </div>
                            <div className="event-actions">
                                <button
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(event);
                                    }}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={(e) => handleDelete(event._id, e)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyEventsPage; 