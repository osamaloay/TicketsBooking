import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, eventService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaChartBar, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaDollarSign, FaUsers, FaInfoCircle } from 'react-icons/fa';
import EventForm from './EventForm';
import './MyEventsPage.css';

const TypingAnimation = () => {
    const phrases = [
        "Create Events 🎇",
        "Share Vision ✨",
        "Make Magic 🌟",
        "Connect People 🎉",
        "Dream Big 🎭"
    ];
    const [currentPhrase, setCurrentPhrase] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;
        const typeSpeed = 20; // Faster typing speed
        const deleteSpeed = 15; // Faster deleting speed
        const pauseTime = 800; // Shorter pause

        const type = () => {
            const phrase = phrases[currentPhrase];
            
            if (!isDeleting && currentText === phrase) {
                timeout = setTimeout(() => setIsDeleting(true), pauseTime);
                return;
            }

            if (isDeleting && currentText === '') {
                setIsDeleting(false);
                setCurrentPhrase((prev) => (prev + 1) % phrases.length);
                return;
            }

            // Handle emoji typing
            const delta = isDeleting ? -1 : 1;
            let nextText;
            
            if (!isDeleting) {
                // When typing, check if next character is emoji
                const nextChar = phrase[currentText.length];
                if (nextChar && nextChar.match(/[\u{1F300}-\u{1F9FF}]/u)) {
                    // If it's an emoji, add it immediately
                    nextText = phrase.substring(0, currentText.length + 2);
                } else {
                    nextText = phrase.substring(0, currentText.length + 1);
                }
            } else {
                // When deleting, check if current character is emoji
                const lastChar = currentText[currentText.length - 1];
                if (lastChar && lastChar.match(/[\u{1F300}-\u{1F9FF}]/u)) {
                    // If it's an emoji, remove it completely
                    nextText = currentText.substring(0, currentText.length - 2);
                } else {
                    nextText = currentText.substring(0, currentText.length - 1);
                }
            }

            setCurrentText(nextText);
            timeout = setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
        };

        timeout = setTimeout(type, 100);
        return () => clearTimeout(timeout);
    }, [currentText, currentPhrase, isDeleting]);

    return (
        <div className="typing-animation">
            <span className="typing-text">{currentText}</span>
            <span className="typing-cursor">|</span>
        </div>
    );
};

const MyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [expandedEvent, setExpandedEvent] = useState(null);
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
        navigate(`/my-events/${event._id}/edit`);
    };

    const handleDelete = async (eventId, e) => {
        e.stopPropagation();
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

    const toggleEventExpand = (eventId) => {
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
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

    if (loading) {
        return (
            <div className="events-loading">
                <div className="loading-spinner"></div>
                <p>Loading your events...</p>
            </div>
        );
    }

    return (
        <div className="my-events-container">
            <div className="events-header">
                <div className="header-content">
                    <h2>My Events</h2>
                    <TypingAnimation />
                </div>
                <button className="create-event-button" onClick={() => navigate('/my-events/new')}>
                    <FaPlus /> Create New Event
                </button>
            </div>

            <div className="events-grid">
                {events.map((event) => (
                    <div 
                        key={event._id} 
                        className={`event-card ${expandedEvent === event._id ? 'expanded' : ''}`}
                        onClick={() => toggleEventExpand(event._id)}
                    >
                        <div className="event-image">
                            {event.image ? (
                                <img src={event.image.url} alt={event.title} />
                            ) : (
                                <div className="no-image">
                                    <FaCalendarAlt />
                                    <span>No Image</span>
                                </div>
                            )}
                            <div className="event-status">
                                <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
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
                                    <FaTicketAlt />
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
                            <div className="event-stats">
                                <div className="stat-item">
                                    <FaUsers />
                                    <span>{event.attendees || 0} Attendees</span>
                                </div>
                                <div className="stat-item">
                                    <FaDollarSign />
                                    <span>${event.revenue || 0} Revenue</span>
                                </div>
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