import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './EventForm.css';
import MapPicker from '../shared/MapPicker';

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
    const [location, setLocation] = useState({
        address: '',
        coordinates: {
            lat: null,
            lng: null
        }
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

                    // Ensure all form fields have default values
                    setFormData({
                        title: event.title || '',
                        description: event.description || '',
                        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                        time: event.time || '',
                        category: event.category || '',
                        totalTickets: event.totalTickets || '',
                        ticketPricing: event.ticketPricing || '',
                        image: event.image || null
                    });

                    // Set location data with proper null checks
                    if (event.location && event.location.coordinates) {
                        setLocation({
                            address: event.location.address || '',
                            coordinates: {
                                lat: event.location.coordinates.lat || null,
                                lng: event.location.coordinates.lng || null
                            }
                        });
                    } else {
                        setLocation({
                            address: '',
                            coordinates: {
                                lat: null,
                                lng: null
                            }
                        });
                    }
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

    const handleLocationSelect = (coordinates) => {
        setLocation(prev => ({
            ...prev,
            coordinates
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!location.coordinates.lat || !location.coordinates.lng) {
            toast.error('Please select a location on the map');
            return;
        }

        // Log the form data before creating FormData
        console.log('Form Data:', formData);
        console.log('Location:', location);

        const eventFormData = new FormData();
        eventFormData.append('title', formData.title);
        eventFormData.append('description', formData.description);
        eventFormData.append('date', formData.date);
        eventFormData.append('location', JSON.stringify({
            address: location.address,
            coordinates: {
                lat: location.coordinates.lat,
                lng: location.coordinates.lng
            }
        }));
        eventFormData.append('category', formData.category);
        eventFormData.append('ticketPricing', formData.ticketPricing);
        eventFormData.append('totalTickets', formData.totalTickets);
        eventFormData.append('remainingTickets', formData.totalTickets); // Set remaining tickets equal to total tickets initially
        eventFormData.append('organizer', user._id); // Add the organizer ID
        if (formData.image) {
            eventFormData.append('image', formData.image);
        }

        // Log the FormData contents
        for (let pair of eventFormData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            setLoading(true);
            if (id) {
                await eventService.updateEvent(id, eventFormData);
                toast.success('Event updated successfully');
            } else {
                const response = await eventService.createEvent(eventFormData);
                console.log('Server Response:', response);
                toast.success('Event created successfully');
            }
            navigate('/my-events');
        } catch (error) {
            console.error('Error details:', error.response?.data);
            toast.error(error.response?.data?.message || 'Error saving event');
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
                    <label>Location</label>
                    <div className="location-display">
                        {location.address ? (
                            <>
                                <p><strong>Address:</strong> {location.address}</p>
                                <p><strong>Coordinates:</strong> {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}</p>
                            </>
                        ) : (
                            <p>No location selected</p>
                        )}
                    </div>
                    <MapPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={id && location.coordinates.lat && location.coordinates.lng ? 
                            [location.coordinates.lat, location.coordinates.lng] : null}
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