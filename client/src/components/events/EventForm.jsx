import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './EventForm.css';

const EventForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { ROLES, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        totalTickets: '',
        ticketPricing: '',
        image: null
    });

    useEffect(() => {
        const checkOrganizerStatus = async () => {
            try {
                console.log('Auth Context User:', user);
                console.log('Auth Context ROLES:', ROLES);

                // Get current user profile
                const currentUser = await userService.getUserProfile();
                console.log('API Current User:', currentUser);
                console.log('User Role:', currentUser.role);
                console.log('Expected Role:', ROLES.ORGANIZER);
                console.log('Role Match:', currentUser.role === ROLES.ORGANIZER);

                setIsOrganizer(currentUser.role === ROLES.ORGANIZER);
                
                // If not organizer, redirect to home
                if (currentUser.role !== ROLES.ORGANIZER) {
                    console.log('Role mismatch - redirecting to home');
                    toast.error('Only organizers can create or edit events');
                    navigate('/');
                    return;
                }

                // If editing, fetch event data
                if (id) {
                    console.log('Fetching event with ID:', id);
                    const event = await eventService.getEventById(id);
                    console.log('Event data:', event);

                    // Get all events for the current organizer
                    const organizerEvents = await userService.getOrganizerEvents();
                    console.log('Organizer Events:', organizerEvents);

                    // Check if the event exists in the organizer's events
                    const isEventOrganizer = organizerEvents.some(evt => evt._id === id);
                    console.log('Is Event Organizer:', isEventOrganizer);

                    if (!isEventOrganizer) {
                        console.log('Not the event organizer - redirecting to my-events');
                        toast.error('You can only edit your own events');
                        navigate('/my-events');
                        return;
                    }

                    setFormData({
                        title: event.title,
                        description: event.description,
                        date: new Date(event.date).toISOString().split('T')[0],
                        time: event.time,
                        location: event.location,
                        category: event.category,
                        totalTickets: event.totalTickets,
                        ticketPricing: event.ticketPricing,
                        image: event.image
                    });
                }
            } catch (error) {
                console.error('Error checking organizer status:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error('Error verifying organizer status');
                navigate('/');
            }
        };

        checkOrganizerStatus();
    }, [id, navigate, ROLES, user]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (id) {
                await eventService.updateEvent(id, formDataToSend);
                toast.success('Event updated successfully');
            } else {
                await eventService.createEvent(formDataToSend);
                toast.success('Event created successfully');
            }
            navigate('/my-events');
        } catch (error) {
            console.error('Error submitting event:', error);
            toast.error(error.response?.data?.message || 'Error submitting event');
        } finally {
            setLoading(false);
        }
    };

    if (!isOrganizer) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="event-form-container">
            <h2>{id ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label htmlFor="title">Event Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="music">Music</option>
                        <option value="sports">Sports</option>
                        <option value="arts">Arts</option>
                        <option value="food">Food</option>
                        <option value="technology">Technology</option>
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="totalTickets">Total Tickets</label>
                        <input
                            type="number"
                            id="totalTickets"
                            name="totalTickets"
                            value={formData.totalTickets}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ticketPricing">Ticket Price ($)</label>
                        <input
                            type="number"
                            id="ticketPricing"
                            name="ticketPricing"
                            value={formData.ticketPricing}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Event Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        required={!id}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/my-events')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Saving...' : (id ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm; 