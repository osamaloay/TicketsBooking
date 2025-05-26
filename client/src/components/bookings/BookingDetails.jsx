import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaDollarSign, FaInfoCircle, FaTimes, FaArrowLeft, FaClock, FaUser, FaCar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/Bookings.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
        // Get user's current location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Could not get your current location");
                }
            );
        }
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const response = await bookingService.getBookingById(id);
            setBooking(response);
            setError(null);
        } catch (error) {
            setError(error.message);
            toast.error('Failed to fetch booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            await bookingService.cancelBooking(id);
            toast.success('Booking cancelled successfully');
            navigate('/bookings');
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const handleGetRide = () => {
        if (!userLocation) {
            toast.error("Please allow location access to get ride options");
            return;
        }

        if (!booking?.event?.location?.coordinates) {
            toast.error("Event location not available");
            return;
        }

        const { lat, lng } = booking.event.location.coordinates;
        const address = encodeURIComponent(booking.event.location.address);
        
        // Format coordinates for Uber
        const pickup = `${userLocation.lat},${userLocation.lng}`;
        const dropoff = `${lat},${lng}`;
        
        // Open Uber with proper URL format
        window.open(`https://m.uber.com/ul/?action=setPickup&pickup=${pickup}&dropoff=${dropoff}&dropoff[formatted_address]=${address}`, '_blank');
        
        // Open Careem with proper URL format
        window.open(`https://www.careem.com/ride/?pickup=${pickup}&dropoff=${dropoff}&dropoff_address=${address}`, '_blank');
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!booking) return <ErrorMessage message="Booking not found" />;

    return (
        <div className="booking-details-container">
            <div className="booking-details-header">
                <Button 
                    variant="secondary"
                    onClick={() => navigate('/bookings')}
                    className="back-button"
                >
                    <FaArrowLeft className="icon" />
                    Back to Bookings
                </Button>
                <h2>Booking Details</h2>
            </div>

            <div className="booking-details-content">
                <div className="booking-main-section">
                    <div className="booking-image-section">
                        <img 
                            src={booking.event.image?.url || '/default-event-image.jpg'} 
                            alt={booking.event.title}
                            className="event-image"
                        />
                        <div className={`status-badge ${booking.status}`}>
                            {booking.status}
                        </div>
                    </div>

                    <div className="booking-info-section">
                        <h3 className="event-title">{booking.event.title}</h3>
                        
                        <div className="booking-info-grid">
                            <div className="info-section">
                                <h4>Event Information</h4>
                                <div className="info-item">
                                    <FaCalendarAlt className="icon" />
                                    <div className="info-content">
                                        <span className="label">Date</span>
                                        <span className="value">
                                            {new Date(booking.event.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaClock className="icon" />
                                    <div className="info-content">
                                        <span className="label">Time</span>
                                        <span className="value">
                                            {new Date(booking.event.date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaMapMarkerAlt className="icon" />
                                    <div className="info-content">
                                        <span className="label">Location</span>
                                        <span className="value">{booking.event.location.address || 'Location not specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h4>Booking Information</h4>
                                <div className="info-item">
                                    <FaTicketAlt className="icon" />
                                    <div className="info-content">
                                        <span className="label">Tickets</span>
                                        <span className="value">{booking.numberOfTickets} tickets</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaDollarSign className="icon" />
                                    <div className="info-content">
                                        <span className="label">Total Price</span>
                                        <span className="value">${booking.totalPrice}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaUser className="icon" />
                                    <div className="info-content">
                                        <span className="label">Booking ID</span>
                                        <span className="value">{booking._id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {booking.status === 'confirmed' && (
                            <div className="booking-actions">
                                <Button
                                    variant="danger"
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="cancel-button"
                                >
                                    <FaTimes className="icon" />
                                    Cancel Booking
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {booking.event.location.coordinates && (
                    <div className={`booking-map-section ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <FaChevronRight /> : <FaChevronLeft />}
                        </button>
                        <div className="map-header">
                            <h4><FaMapMarkerAlt /> Event Location</h4>
                            <Button
                                variant="primary"
                                onClick={handleGetRide}
                                className="ride-share-button"
                            >
                                <FaCar className="icon" />
                                Get a Ride
                            </Button>
                        </div>
                        <div className="map-container">
                            <MapContainer
                                center={[booking.event.location.coordinates.lat, booking.event.location.coordinates.lng]}
                                zoom={15}
                                style={{ height: '400px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker 
                                    position={[booking.event.location.coordinates.lat, booking.event.location.coordinates.lng]}
                                >
                                    <Popup>
                                        <div className="location-popup">
                                            <p>{booking.event.location.address}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>

            {showCancelConfirm && (
                <div className="cancel-confirmation-modal">
                    <div className="modal-content">
                        <h3>Cancel Booking</h3>
                        <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <Button
                                variant="secondary"
                                onClick={() => setShowCancelConfirm(false)}
                            >
                                Keep Booking
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleCancelBooking}
                            >
                                Yes, Cancel Booking
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetails;
