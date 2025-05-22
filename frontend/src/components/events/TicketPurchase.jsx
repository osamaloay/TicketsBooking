import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './TicketPurchase.css';

const TicketPurchase = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch event details
    const fetchEventDetails = async () => {
      try {
        // Add your API call here to fetch event details
        // const response = await eventService.getEventById(id);
        // setEvent(response.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handlePurchase = async () => {
    try {
      // Add your API call here to process the purchase
      // await ticketService.purchaseTicket(event.id, quantity);
      toast.success('Tickets purchased successfully!');
      navigate('/dashboard/tickets');
    } catch (error) {
      toast.error('Failed to purchase tickets');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  return (
    <div className="ticket-purchase">
      <h1>Purchase Tickets</h1>
      
      <div className="event-summary">
        <h2>{event.title}</h2>
        <p className="event-date">{event.date}</p>
        <p className="event-location">{event.location}</p>
      </div>

      <div className="purchase-form">
        <div className="form-group">
          <label>Number of Tickets</label>
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= event.availableTickets}
            >
              +
            </button>
          </div>
        </div>

        <div className="price-summary">
          <div className="price-row">
            <span>Price per ticket</span>
            <span>${event.price}</span>
          </div>
          <div className="price-row">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="price-row total">
            <span>Total</span>
            <span>${(event.price * quantity).toFixed(2)}</span>
          </div>
        </div>

        <button 
          className="purchase-button"
          onClick={handlePurchase}
        >
          Complete Purchase
        </button>
      </div>
    </div>
  );
};

export default TicketPurchase; 