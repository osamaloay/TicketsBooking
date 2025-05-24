import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/bookingService';
import BookingDetailsModal from './BookingDetailsModal';
import './UserBookingsPage.css';

const UserBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchUserBookings(); // Refresh the list
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="user-bookings-container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <button 
            className="browse-events-button"
            onClick={() => navigate('/')}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.event.title}</h3>
                <span className={`booking-status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-details">
                <p>
                  <i className="fas fa-calendar-alt"></i>
                  {new Date(booking.event.date).toLocaleDateString()}
                </p>
                <p>
                  <i className="fas fa-map-marker-alt"></i>
                  {booking.event.location}
                </p>
                <p>
                  <i className="fas fa-ticket-alt"></i>
                  {booking.quantity} tickets
                </p>
                <p>
                  <i className="fas fa-dollar-sign"></i>
                  Total: ${booking.totalAmount}
                </p>
              </div>

              <div className="booking-actions">
                <button 
                  className="view-details-button"
                  onClick={() => handleViewDetails(booking)}
                >
                  View Details
                </button>
                {booking.status === 'CONFIRMED' && (
                  <button 
                    className="cancel-booking-button"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserBookingsPage; 