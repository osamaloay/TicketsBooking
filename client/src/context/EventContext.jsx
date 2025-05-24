// client/src/context/EventContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { eventService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // We'll use this to check auth status

const EventContext = createContext();

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};

export const EventProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        date: '',
        price: '',
        search: ''
    });

    // Public methods (available to all users)
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await eventService.getAllEvents();
            setEvents(response);
            return response;
        } catch (error) {
            toast.error('Failed to fetch events');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventById = async (id) => {
        setLoading(true);
        try {
            const response = await eventService.getEventById(id);
            setCurrentEvent(response);
            return response;
        } catch (error) {
            toast.error('Failed to fetch event details');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const getFilteredEvents = () => {
        return events.filter(event => {
            if (filters.category && event.category !== filters.category) return false;
            if (filters.date && new Date(event.date) < new Date(filters.date)) return false;
            if (filters.price && event.price > filters.price) return false;
            if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
            return true;
        });
    };

    // Protected methods (only for authenticated users)
    const createEvent = async (eventData) => {
        if (!isAuthenticated) {
            toast.error('Please login to create events');
            return;
        }
        if (user.role !== 'organizer') {
            toast.error('Only organizers can create events');
            return;
        }

        setLoading(true);
        try {
            const response = await eventService.createEvent(eventData);
            setEvents(prev => [...prev, response]);
            toast.success('Event created successfully');
            return response;
        } catch (error) {
            toast.error('Failed to create event');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async (id, eventData) => {
        if (!isAuthenticated) {
            toast.error('Please login to update events');
            return;
        }
        if (user.role !== 'organizer') {
            toast.error('Only organizers can update events');
            return;
        }

        setLoading(true);
        try {
            const response = await eventService.updateEvent(id, eventData);
            setEvents(prev => prev.map(event => 
                event.id === id ? response : event
            ));
            toast.success('Event updated successfully');
            return response;
        } catch (error) {
            toast.error('Failed to update event');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!isAuthenticated) {
            toast.error('Please login to delete events');
            return;
        }
        if (user.role !== 'organizer') {
            toast.error('Only organizers can delete events');
            return;
        }

        setLoading(true);
        try {
            await eventService.deleteEvent(id);
            setEvents(prev => prev.filter(event => event.id !== id));
            toast.success('Event deleted successfully');
        } catch (error) {
            toast.error('Failed to delete event');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Organizer-specific methods
    const fetchOrganizerEvents = async () => {
        if (!isAuthenticated || user.role !== 'organizer') {
            toast.error('Only organizers can access this feature');
            return;
        }

        setLoading(true);
        try {
            const response = await eventService.getOrganizerEvents();
            setEvents(response);
            return response;
        } catch (error) {
            toast.error('Failed to fetch your events');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventAnalytics = async () => {
        if (!isAuthenticated || user.role !== 'organizer') {
            toast.error('Only organizers can access analytics');
            return;
        }

        setLoading(true);
        try {
            const response = await eventService.getEventAnalytics();
            return response;
        } catch (error) {
            toast.error('Failed to fetch event analytics');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <EventContext.Provider
            value={{
                events,
                currentEvent,
                loading,
                error,
                filters,
                // Public methods
                fetchEvents,
                fetchEventById,
                filterEvents,
                getFilteredEvents,
                // Protected methods
                createEvent,
                updateEvent,
                deleteEvent,
                fetchOrganizerEvents,
                fetchEventAnalytics,
                setError
            }}
        >
            {children}
        </EventContext.Provider>
    );
};