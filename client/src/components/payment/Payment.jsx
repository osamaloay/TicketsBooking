import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import '../payment/Payment.css';

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { currentEvent, loading: eventLoading, error: eventError, fetchEventById } = useEvent();
    const { user } = useAuth();
    const { createBooking, loading: bookingLoading } = useBooking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticketCount, setTicketCount] = useState(1);
    const [cardComplete, setCardComplete] = useState(false);

    useEffect(() => {
        fetchEventById(id);
    }, [id, fetchEventById]);

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        setError(event.error ? event.error.message : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            return;
        }

        try {
            // Create payment method
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: user.name,
                    email: user.email,
                },
            });

            if (paymentMethodError) {
                throw new Error(paymentMethodError.message);
            }

            // Create booking using your BookingContext
            await createBooking({
                event: id,
                user: user._id,
                numberOfTickets: ticketCount,
                paymentMethodId: paymentMethod.id
            });
            
            toast.success('Booking confirmed! Check your email for tickets.');
            navigate('/bookings');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (eventLoading || bookingLoading) return <LoadingSpinner />;
    if (eventError) return <ErrorMessage message={eventError} />;
    if (!currentEvent) return <ErrorMessage message="Event not found" />;

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Complete Your Booking</h2>
                    <p className="event-title">{currentEvent.title}</p>
                </div>

                <div className="event-summary">
                    <div className="summary-item">
                        <span>Date:</span>
                        <span>{new Date(currentEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="summary-item">
                        <span>Location:</span>
                        <span>{currentEvent.location}</span>
                    </div>
                    <div className="summary-item">
                        <span>Price per ticket:</span>
                        <span>${currentEvent.ticketPricing}</span>
                    </div>
                </div>

                <div className="ticket-selection">
                    <label>
                        Number of Tickets:
                        <select 
                            value={ticketCount} 
                            onChange={(e) => setTicketCount(Number(e.target.value))}
                            className="ticket-select"
                        >
                            {[...Array(currentEvent.remainingTickets)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="total-price">
                        <span>Total Amount:</span>
                        <span>${(currentEvent.ticketPricing * ticketCount).toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="card-element-container">
                        <label>Card Details</label>
                        <CardElement
                            onChange={handleCardChange}
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
                        disabled={!stripe || loading || !cardComplete}
                        variant="primary"
                        fullWidth
                    >
                        {loading ? 'Processing...' : `Pay $${(currentEvent.ticketPricing * ticketCount).toFixed(2)}`}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Payment;
