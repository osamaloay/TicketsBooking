// client/src/components/events/EventDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Button } from '../shared/Button';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`/api/events/${id}`);
                setEvent(response.data);
            } catch (err) {
                setError('Failed to load event details');
                console.error('Error fetching event:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleBookTicket = () => {
        if (!isAuthenticated) {
            // Store current URL in localStorage before redirecting to login
            localStorage.setItem('redirectAfterLogin', `/events/${id}`);
            navigate('/login');
            return;
        }
        // If authenticated, show booking form
        // We'll implement this later
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!event) return <ErrorMessage message="Event not found" />;

    return (
        <div className="event-details">
            <div className="event-header">
                <h1>{event.title}</h1>
                <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
            </div>

            <div className="event-image">
                <img src={event.image} alt={event.title} />
            </div>

            <div className="event-info">
                <div className="info-section">
                    <h3>Location</h3>
                    <p>{event.location}</p>
                </div>

                <div className="info-section">
                    <h3>Description</h3>
                    <p>{event.description}</p>
                </div>

                <div className="info-section">
                    <h3>Price</h3>
                    <p>${event.price}</p>
                </div>

                <div className="info-section">
                    <h3>Tickets Available</h3>
                    <p>{event.availableTickets}</p>
                </div>
            </div>

            <Button 
                onClick={handleBookTicket}
                variant="primary"
                fullWidth
            >
                {isAuthenticated ? 'Book Tickets' : 'Login to Book Tickets'}
            </Button>
        </div>
    );
};

export default EventDetails;