import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import './UserBookingsPage.css';

/**
 * Displays the list of bookings for the current user.
 */
export default function UserBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await bookingService.getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id) => {
    try {
      await bookingService.cancelBooking(id);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  };

  if (loading) return <div className="loader">Loading bookings…</div>;
  if (!bookings.length) return <p className="no-bookings">No bookings found.</p>;

  return (
    <div className="bookings-list">
      {bookings.map(b => (
        <div key={b._id} className="booking-item">
          <h3>{b.event.title}</h3>
          <p>Quantity: {b.numberOfTickets}</p>
          <p>Total: {b.totalPrice.toLocaleString()} EGP</p>
          <button onClick={() => handleCancel(b._id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
