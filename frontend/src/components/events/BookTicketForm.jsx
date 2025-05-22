import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './BookTicketForm.css';

const BookTicketForm = ({ event, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add your API call here to process the purchase
      // await ticketService.purchaseTicket(event.id, quantity);
      onSuccess();
    } catch (error) {
      toast.error('Failed to purchase tickets');
      setLoading(false);
    }
  };

  const totalPrice = event.price * quantity;

  return (
    <div className="book-ticket-form">
      <div className="form-header">
        <h2>Purchase Tickets</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Number of Tickets</label>
          <div className="quantity-selector">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || loading}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= event.availableTickets || loading}
            >
              +
            </button>
          </div>
          <p className="available-tickets">
            {event.availableTickets} tickets available
          </p>
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
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="purchase-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookTicketForm; 