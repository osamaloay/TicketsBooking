import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import toast from 'react-hot-toast';
import './TicketPurchase.css';

/**
 * Page for purchasing tickets for a specific event.
 */
export default function TicketPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await eventService.getEventDetails(id);
        setEvent(data);
        setTotal(data.ticketPricing);
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (event) setTotal(event.ticketPricing * quantity);
  }, [quantity, event]);

  const handlePurchase = async () => {
    if (!user) {
      toast('Please log in first', { icon: '🔒' });
      return navigate('/login');
    }
    if (processing) return;
    try {
      setProcessing(true);
      if (event.remainingTickets < quantity) throw new Error('Insufficient tickets');
      await bookingService.createBooking({ eventId: id, numberOfTickets: quantity });
      toast.success('Booking successful!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loader">Loading…</div>;
  if (!event) return <p className="error">Event not found.</p>;

  return (
    <div className="purchase-container">
      <h1>Purchase Tickets for {event.title}</h1>
      <div className="purchase-details">
        <label>Quantity:</label>
        <input
          type="number"
          min="1"
          max={event.remainingTickets}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
        />
        <p>Total Price: {total.toLocaleString()} EGP</p>
      </div>
      <button onClick={handlePurchase} disabled={processing || event.remainingTickets === 0}>
        {processing ? 'Processing...' : 'Confirm Purchase'}
      </button>
    </div>
  );
}