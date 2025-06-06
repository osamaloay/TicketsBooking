// client/src/components/bookings/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService, userService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaDollarSign, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../../styles/Bookings.css';
import { useNavigate } from 'react-router-dom';

function Bookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserBookings();
            console.log('Bookings response:', response); // Debug log
            if (Array.isArray(response)) {
                setBookings(response);
            } else {
                console.error('Invalid response format:', response);
                setBookings([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError(error.message || 'Failed to fetch bookings');
            setBookings([]);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            // Check if booking is already cancelled
            const booking = bookings.find(b => b._id === bookingId);
            if (!booking) {
                toast.error('Booking not found');
                return;
            }
            
            if (booking.status === 'cancelled') {
                toast.info('This booking is already cancelled');
                return;
            }

            setLoading(true);
            await bookingService.cancelBooking(bookingId);
            toast.success('Booking cancelled successfully');
            await fetchBookings();
        } catch (error) {
            console.error('Error canceling booking:', error);
            toast.error(error.message || 'Failed to cancel booking');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (bookingId) => {
        navigate(`/bookings/${bookingId}`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h2>My Bookings</h2>
                <p className="booking-subtitle">🎟️ Manage your event tickets and bookings 📅</p>
            </div>
            
            {!loading && bookings.length === 0 ? (
                <div className="no-bookings">
                    <FaTicketAlt className="no-bookings-icon" />
                    <h3>No Bookings Yet</h3>
                    <p>You haven't made any bookings yet. Start exploring events!</p>
                    <Button 
                        variant="primary"
                        onClick={() => navigate('/events')}
                    >
                        Browse Events
                    </Button>
                </div>
            ) : (
                <div className="bookings-grid">
                    {bookings.map(booking => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-image">
                                <img 
                                    src={booking.event?.image?.url || '/default-event-image.jpg'} 
                                    alt={booking.event?.title || 'Event'}
                                />
                                <div className={`status-badge ${booking.status}`}>
                                    {booking.status}
                                </div>
                            </div>

                            <div className="booking-content">
                                <h3 className="event-title">{booking.event?.title || 'Event Not Available'}</h3>
                                
                                <div className="booking-info">
                                    <div className="info-item">
                                        <FaCalendarAlt className="icon" />
                                        <span>{booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        }) : 'Date not available'}</span>
                                    </div>
                                    
                                    <div className="info-item">
                                        <FaMapMarkerAlt className="icon" />
                                        <span>{booking.event?.location?.address || 'Location not specified'}</span>
                                    </div>
                                    
                                    <div className="info-item">
                                        <FaTicketAlt className="icon" />
                                        <span>{booking.numberOfTickets} tickets</span>
                                    </div>
                                    
                                    <div className="info-item">
                                        <FaDollarSign className="icon" />
                                        <span>${booking.totalPrice}</span>
                                    </div>
                                </div>

                                <div className="booking-actions">
                                    <Button
                                        variant="primary"
                                        onClick={() => handleViewDetails(booking._id)}
                                    >
                                        <FaInfoCircle className="icon" />
                                        View Details
                                    </Button>
                                    {booking.status === 'confirmed' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleCancelBooking(booking._id)}
                                        >
                                            <FaTimes className="icon" />
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bookings;