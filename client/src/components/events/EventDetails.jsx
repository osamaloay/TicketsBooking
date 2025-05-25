// client/src/components/events/EventDetails.jsx
import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';
import { toast } from 'react-toastify';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { 
        currentEvent, 
        loading, 
        error, 
        fetchEventById 
    } = useEvent();

    // Use useCallback to memoize the fetchEventById call
    const loadEvent = useCallback(async () => {
        if (!currentEvent || currentEvent._id !== id) {
            await fetchEventById(id);
        }
    }, [id, currentEvent, fetchEventById]);

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);

    const handleBookTicket = () => {
        if (!isAuthenticated) {
            // Store the current path for redirect after login
            localStorage.setItem('redirectAfterLogin', `/events/${id}`);
            navigate('/login');
            return;
        }

        // Check user role
        if (user.role === 'Organizer' || user.role === 'System Admin') {
            toast.info('Organizers and Admins cannot book tickets');
            navigate('/dashboard');
            return;
        }

        // If user is authenticated and is a Standard User, proceed to payment
        navigate(`/payment/${id}`);
    };

    // Show loading spinner only when we have no event data and are loading
    if (loading && !currentEvent) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!currentEvent) {
        return <ErrorMessage message="Event not found" />;
    }

    return (
        <div className="event-details">
            <div className="event-header">
                <h1>{currentEvent.title}</h1>
                <p className="event-date">{new Date(currentEvent.date).toLocaleDateString()}</p>
            </div>

            <div className="event-image">
                <img 
                    src={currentEvent.image || '/default-event-image.jpg'} 
                    alt={currentEvent.title} 
                />
            </div>

            <div className="event-info">
                <div className="info-section">
                    <h3>Location</h3>
                    <p>{currentEvent.location}</p>
                </div>

                <div className="info-section">
                    <h3>Description</h3>
                    <p>{currentEvent.description}</p>
                </div>

                <div className="info-section">
                    <h3>Category</h3>
                    <p>{currentEvent.category}</p>
                </div>

                <div className="info-section">
                    <h3>Price</h3>
                    <p>${currentEvent.ticketPricing}</p>
                </div>

                <div className="info-section">
                    <h3>Tickets Available</h3>
                    <p>{currentEvent.remainingTickets} of {currentEvent.totalTickets}</p>
                </div>
            </div>

            <Button 
                onClick={handleBookTicket}
                variant="primary"
                fullWidth
                disabled={currentEvent.remainingTickets === 0}
            >
                {currentEvent.remainingTickets === 0 
                    ? 'Sold Out' 
                    : isAuthenticated 
                        ? (user.role === 'Standard User' 
                            ? 'Book Tickets' 
                            : 'Not Available for Your Role')
                        : 'Login to Book Tickets'
                }
            </Button>
        </div>
    );
};

export default EventDetails;