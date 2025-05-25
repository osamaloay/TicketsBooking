// client/src/components/bookings/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService , userService} from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';
import '../../styles/bookings.css';

const Bookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await userService.getUserBookings();
            setBookings(response);
            setError(null);
        } catch (error) {
            setError(error.message);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await bookingService.cancelBooking(bookingId);
            toast.success('Booking cancelled successfully');
            // Refresh bookings list
            fetchBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="bookings-container">
            <h2>My Bookings</h2>
            
            {bookings.length === 0 ? (
                <p className="no-bookings">You haven't made any bookings yet.</p>
            ) : (
                <div className="bookings-grid">
                    {bookings.map(booking => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <h3>{booking.event.title}</h3>
                                <span className={`status ${booking.status}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="booking-details">
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {new Date(booking.event.date).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Location:</strong> {booking.event.location}
                                </p>
                                <p>
                                    <strong>Tickets:</strong> {booking.numberOfTickets}
                                </p>
                                <p>
                                    <strong>Total Price:</strong> ${booking.totalPrice}
                                </p>
                            </div>

                            {booking.status === 'confirmed' && (
                                <Button
                                    variant="danger"
                                    onClick={() => handleCancelBooking(booking._id)}
                                >
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;