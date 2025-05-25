import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { stripeService } from '../../services/api';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { bookingService } from '../../services/api';

const PaymentForm = ({ event, ticketCount, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system not initialized');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      // Create booking with payment method
      const bookingData = {
        event: event._id,
        numberOfTickets: ticketCount,
        paymentMethodId: paymentMethod.id
      };

      const response = await bookingService.createBooking(bookingData);
      onSuccess(response);
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${totalPrice}`}
      </Button>
    </form>
  );
};

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { currentEvent, loading, error, fetchEventById } = useEvent();
    const [ticketCount, setTicketCount] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [stripePromise, setStripePromise] = useState(null);

    // Fetch Stripe public key on component mount
    useEffect(() => {
        const initializeStripe = async () => {
            try {
                const publicKey = await stripeService.getPublicKey();
                setStripePromise(loadStripe(publicKey));
            } catch (error) {
                toast.error('Failed to initialize payment system');
                console.error('Stripe initialization error:', error);
            }
        };

        initializeStripe();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Standard User') {
            navigate('/dashboard');
            return;
        }

        fetchEventById(id);
    }, [id, isAuthenticated, user.role]);

    useEffect(() => {
        if (currentEvent) {
            setTotalPrice(currentEvent.ticketPricing * ticketCount);
        }
    }, [ticketCount, currentEvent]);

    const handleTicketCountChange = (e) => {
        const count = parseInt(e.target.value);
        if (count > 0 && count <= currentEvent.remainingTickets) {
            setTicketCount(count);
        }
    };

    const handlePaymentSuccess = (response) => {
        toast.success('Booking successful!');
        navigate('/bookings');
    };

    if (!stripePromise) {
        return <LoadingSpinner />;
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!currentEvent) return <ErrorMessage message="Event not found" />;

    return (
        <div className="payment-container">
            <h2>Book Tickets for {currentEvent.title}</h2>
            
            <div className="ticket-selection">
                <label>
                    Number of Tickets:
                    <input
                        type="number"
                        min="1"
                        max={currentEvent.remainingTickets}
                        value={ticketCount}
                        onChange={handleTicketCountChange}
                    />
                </label>
            </div>

            <div className="price-summary">
                <p>Price per ticket: ${currentEvent.ticketPricing}</p>
                <p>Total price: ${totalPrice}</p>
            </div>

            <Elements stripe={stripePromise}>
                <PaymentForm
                    event={currentEvent}
                    ticketCount={ticketCount}
                    totalPrice={totalPrice}
                    onSuccess={handlePaymentSuccess}
                />
            </Elements>
        </div>
    );
};

export default Payment;
