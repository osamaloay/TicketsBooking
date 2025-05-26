// client/src/components/events/EventDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaUser, FaEdit, FaClock, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ROLES } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [isEventOrganizer, setIsEventOrganizer] = useState(false);

    useEffect(() => {
        const fetchEventAndUser = async () => {
            try {
                console.log('Fetching event with ID:', id);
                const eventData = await eventService.getEventById(id);
                console.log('Event data:', eventData);
                setEvent(eventData);

                try {
                    const userData = await userService.getCurrentUser();
                    console.log('User data:', userData);
                    setIsOrganizer(userData.role === ROLES.ORGANIZER);
                    setIsEventOrganizer(eventData.organizer._id === userData._id);
                } catch (userError) {
                    console.log('User not authenticated or error fetching user data:', userError);
                    setIsOrganizer(false);
                    setIsEventOrganizer(false);
                }
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error('Failed to load event details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndUser();
    }, [id, navigate, ROLES]);

    const handleTicketQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= event.remainingTickets) {
            setTicketQuantity(value);
        }
    };

    const handleBookTickets = async () => {
        if (isEventOrganizer) {
            toast.error('You cannot book tickets for your own event');
            return;
        }

        try {
            await eventService.bookTickets(id, ticketQuantity);
            toast.success('Tickets booked successfully!');
            navigate('/my-tickets');
        } catch (error) {
            console.error('Error booking tickets:', error);
            toast.error(error.response?.data?.message || 'Failed to book tickets');
        }
    };

    if (loading) {
        return <div className="event-details-loading">Loading event details...</div>;
    }

    if (!event) {
        return <div className="event-details-error">Event not found</div>;
    }

    return (
        <div className="event-details-container">
            <div className="event-hero">
                <div className="event-image">
                    {event.image ? (
                        <img src={event.image.url} alt={event.title} />
                    ) : (
                        <div className="no-image">No Image Available</div>
                    )}
                </div>
                <div className="event-hero-content">
                    <div className="event-header">
                        <h1>{event.title}</h1>
                        <div className="event-meta">
                            <span className="event-category">{event.category}</span>
                            <span className={`event-status ${event.status}`}>{event.status}</span>
                        </div>
                    </div>
                    <div className="event-quick-info">
                        <div className="info-item">
                            <FaCalendar />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                            <FaClock />
                            <span>{event.time}</span>
                        </div>
                        <div className="info-item">
                            <FaMapMarkerAlt />
                            <span>{event.location}</span>
                        </div>
                        <div className="info-item">
                            <FaTicketAlt />
                            <span>${event.ticketPricing} per ticket</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="event-main-content">
                <div className="event-description-section">
                    <h2><FaInfoCircle /> About This Event</h2>
                    <p className="event-description">{event.description}</p>
                </div>

                <div className="event-sidebar">
                    <div className="ticket-card">
                        <h3>Ticket Information</h3>
                        <div className="ticket-details">
                            <div className="ticket-price">
                                <span className="price-label">Price per ticket</span>
                                <span className="price-value">${event.ticketPricing}</span>
                            </div>
                            <div className="ticket-availability">
                                <span className="availability-label">Available Tickets</span>
                                <span className="availability-value">{event.remainingTickets}</span>
                            </div>
                        </div>

                        {!isEventOrganizer && event.status === 'approved' && event.remainingTickets > 0 && (
                            <div className="booking-section">
                                <div className="ticket-quantity">
                                    <label htmlFor="ticketQuantity">Number of Tickets</label>
                                    <input
                                        type="number"
                                        id="ticketQuantity"
                                        min="1"
                                        max={event.remainingTickets}
                                        value={ticketQuantity}
                                        onChange={handleTicketQuantityChange}
                                    />
                                </div>
                                <div className="total-price">
                                    Total: ${(ticketQuantity * event.ticketPricing).toFixed(2)}
                                </div>
                                <button 
                                    className="book-tickets-button"
                                    onClick={handleBookTickets}
                                >
                                    Book Tickets
                                </button>
                            </div>
                        )}

                        {isEventOrganizer && (
                            <div className="organizer-actions">
                                <button 
                                    className="edit-event-button"
                                    onClick={() => navigate(`/my-events/${event._id}/edit`)}
                                >
                                    <FaEdit className="icon" /> Edit Event
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="organizer-card">
                        <h3>Event Organizer</h3>
                        <div className="organizer-info">
                            <FaUser />
                            <span>{event.organizer.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;