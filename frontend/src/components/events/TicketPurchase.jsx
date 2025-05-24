import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import './TicketPurchase.css';

const TicketPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
        setTotalPrice(data.ticketPrice * quantity);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to fetch event details');
        toast.error(err.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (event) {
      setTotalPrice(event.ticketPrice * quantity);
    }
  }, [quantity, event]);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0 && newQuantity <= event.remainingTickets) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.info('Please sign in to purchase tickets');
      navigate('/login', { state: { from: `/events/${id}/purchase` } });
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      console.log('Starting purchase process...');
      
      // First check if tickets are still available
      const currentEvent = await eventService.getEventById(id);
      console.log('Current event data:', currentEvent);
      
      if (!currentEvent) {
        throw new Error('Event not found');
      }

      if (currentEvent.remainingTickets < quantity) {
        toast.error('Sorry, not enough tickets available');
        return;
      }

      // Create the booking
      const bookingData = {
        eventId: id,
        quantity: quantity,
        totalAmount: totalPrice,
        userId: user._id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location
      };

      console.log('Sending booking data:', bookingData);

      const response = await bookingService.createBooking(bookingData);
      console.log('Booking response:', response);
      
      toast.success('Tickets purchased successfully!');
      navigate('/dashboard', { state: { purchaseSuccess: true } });
    } catch (error) {
      console.error('Purchase error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to purchase tickets. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-purchase-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-purchase-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="ticket-purchase-error">
        <p>Event not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="ticket-purchase-container">
      <div className="ticket-purchase-card">
        <h1>Purchase Tickets</h1>
        
        <div className="event-summary">
          <h2>{event.title}</h2>
          <div className="event-details">
            <p>
              <i className="fas fa-calendar-alt"></i>
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p>
              <i className="fas fa-map-marker-alt"></i>
              {event.location}
            </p>
            <p>
              <i className="fas fa-ticket-alt"></i>
              Price per ticket: ${event.ticketPrice}
            </p>
            <p>
              <i className="fas fa-info-circle"></i>
              Available tickets: {event.remainingTickets}
            </p>
          </div>
        </div>

        <div className="purchase-form">
          <div className="quantity-selector">
            <label htmlFor="quantity">Number of Tickets:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={event.remainingTickets}
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Price per ticket:</span>
              <span>${event.ticketPrice}</span>
            </div>
            <div className="price-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="purchase-actions">
            <button 
              className="purchase-button"
              onClick={handlePurchase}
              disabled={isProcessing || event.remainingTickets === 0}
            >
              {isProcessing ? 'Processing...' : 'Book'}
            </button>
            <button 
              className="cancel-button"
              onClick={() => navigate(-1)}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase; 