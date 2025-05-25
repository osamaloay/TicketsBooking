import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div className="bookings-container">
            <h2>Booking Details</h2>
            <div className="booking-card">
                <div className="booking-header">
                    <h3>{booking.event.title}</h3>
                    <span className={`status ${booking.status}`}>
                        {booking.status}
                    </span>
                </div>

                <div className="booking-details">
                    <div className="info-section">
                        <h4>Event Details</h4>
                        <p><strong>Date:</strong> {new Date(booking.event.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {new Date(booking.event.date).toLocaleTimeString()}</p>
                        <p><strong>Location:</strong> {booking.event.location}</p>
                        <p><strong>Description:</strong> {booking.event.description}</p>
                    </div>

                    <div className="info-section">
                        <h4>Booking Information</h4>
                        <p><strong>Booking ID:</strong> {booking._id}</p>
                        <p><strong>Number of Tickets:</strong> {booking.numberOfTickets}</p>
                        <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
                        <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                    </div>
                </div>

                {booking.status === 'confirmed' && (
                    <div className="booking-actions">
                        <Button
                            variant="danger"
                            onClick={handleCancelBooking}
                        >
                            Cancel Booking
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingDetails;
