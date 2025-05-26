import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaDollarSign, FaInfoCircle, FaTimes, FaArrowLeft, FaClock, FaUser } from 'react-icons/fa';
import '../../styles/Bookings.css';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
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

            <div className="booking-details-card">
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

                <div className="booking-content">
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
                                    <span className="value">{booking.event.location}</span>
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
