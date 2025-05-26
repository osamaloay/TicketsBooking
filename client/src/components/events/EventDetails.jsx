// client/src/components/events/EventDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaUser, FaEdit, FaClock, FaInfoCircle, FaUsers, FaTag, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './EventDetails.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ROLES, isAuthenticated, user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [isEventOrganizer, setIsEventOrganizer] = useState(false);

    useEffect(() => {
        const fetchEventAndUser = async () => {
            try {
                const eventData = await eventService.getEventById(id);
                console.log('Event Data:', eventData);
                setEvent(eventData);

                if (isAuthenticated && user) {
                    setIsOrganizer(user.role === ROLES.ORGANIZER);
                    setIsEventOrganizer(eventData.organizer._id === user._id);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Failed to load event details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndUser();
    }, [id, navigate, ROLES, isAuthenticated, user]);

    const handleTicketQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= event.remainingTickets) {
            setTicketQuantity(value);
        }
    };

    const handleBookTickets = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book tickets');
            return;
        }

        if (!ticketQuantity) {
            toast.error('Please select number of tickets');
            return;
        }

        navigate(`/payment/${event._id}`, {
            state: {
                eventId: event._id,
                eventTitle: event.title,
                ticketPrice: event.ticketPricing,
                ticketQuantity: ticketQuantity,
                totalAmount: ticketQuantity * event.ticketPricing
            }
        });
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
        return <div className="event-details-loading">Loading event details...</div>;
    }

    if (!event) {
        return <div className="event-details-error">Event not found</div>;
    }

    return (
        <div className="event-details-container">
            <div className="event-image-section">
                {event.image?.url ? (
                    <img src={event.image.url} alt={event.title} />
                ) : (
                    <div className="no-image">No Image Available</div>
                )}
            </div>

            <div className="event-header">
                <h1>{event.title}</h1>
                <div className="event-meta">
                    <span className="event-category">
                        <FaTag /> {event.category}
                    </span>
                    {(isOrganizer || user?.role === ROLES.ADMIN) && (
                        <span className={`event-status ${event.status}`}>
                            <FaShieldAlt /> {event.status}
                        </span>
                    )}
                </div>
            </div>

            <div className="event-main-content">
                <div className="event-description-section">
                    <h2><FaInfoCircle /> About This Event</h2>
                    <div className="description-content">
                        <div className="description-text">
                            {event.description.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                        <div className="description-meta">
                            <span className="event-category">
                                <FaTag /> {event.category}
                            </span>
                            <span className="event-location">
                                <FaMapMarkerAlt /> {event.location.address || 'Location not specified'}
                            </span>
                        </div>
                    </div>
                    <div className="event-details-grid">
                        <div className="detail-item">
                            <h4><FaTag /> Event Category</h4>
                            <p>{event.category || 'Not specified'}</p>
                        </div>
                        <div className="detail-item location-item">
                            <h4><FaMapMarkerAlt /> Location</h4>
                            <p>{event.location.address || 'Location not specified'}</p>
                            {event.location.coordinates && (
                                <div className="map-container">
                                    <MapContainer
                                        center={[event.location.coordinates.lat, event.location.coordinates.lng]}
                                        zoom={15}
                                        style={{ height: '250px', width: '100%' }}
                                        zoomControl={false}
                                        dragging={false}
                                        touchZoom={false}
                                        doubleClickZoom={false}
                                        scrollWheelZoom={false}
                                        boxZoom={false}
                                        keyboard={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker 
                                            position={[event.location.coordinates.lat, event.location.coordinates.lng]}
                                        />
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                        <div className="detail-item">
                            <h4><FaCalendar /> Date & Time</h4>
                            <p>{formatDate(event.date)}</p>
                        </div>
                        <div className="detail-item">
                            <h4><FaTicketAlt /> Total Tickets</h4>
                            <p>{event.totalTickets || 0} tickets</p>
                        </div>
                    </div>
                </div>

                <div className="event-sidebar">
                    <div className="ticket-card">
                        <h3>Book Tickets</h3>
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
                                    Proceed to Payment
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
                            <span>{event.organizer?.name || 'Unknown Organizer'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;