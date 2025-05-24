import React, { createContext, useContext, useState } from 'react';
import { bookingService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

export const BookingProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create booking
    const createBooking = async (eventId, numberOfTickets, paymentMethodId) => {
        if (!isAuthenticated) {
            toast.error('Please login to book tickets');
            return;
        }

        setLoading(true);
        try {
            const bookingData = {
                event: eventId,
                user: user.id,
                numberOfTickets: numberOfTickets.toString(), // Backend expects string
                paymentMethodId: paymentMethodId
            };

            const response = await bookingService.createBooking(bookingData);
            setBookings(prev => [...prev, response]);
            toast.success('Booking created successfully');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to create booking');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get booking details
    const getBookingDetails = async (bookingId) => {
        if (!isAuthenticated) {
            toast.error('Please login to view booking details');
            return;
        }

        setLoading(true);
        try {
            const response = await bookingService.getBookingById(bookingId);
            setCurrentBooking(response);
            return response;
        } catch (error) {
            toast.error('Failed to fetch booking details');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cancel booking
    const cancelBooking = async (bookingId) => {
        if (!isAuthenticated) {
            toast.error('Please login to cancel bookings');
            return;
        }

        setLoading(true);
        try {
            await bookingService.cancelBooking(bookingId);
            setBookings(prev => prev.map(booking => 
                booking.id === bookingId 
                    ? { ...booking, status: 'cancelled' }
                    : booking
            ));
            toast.success('Booking cancelled successfully');
        } catch (error) {
            toast.error('Failed to cancel booking');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user bookings
    const fetchUserBookings = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to view your bookings');
            return;
        }

        setLoading(true);
        try {
            const response = await bookingService.getUserBookings();
            setBookings(response);
            return response;
        } catch (error) {
            toast.error('Failed to fetch bookings');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BookingContext.Provider
            value={{
                bookings,
                currentBooking,
                loading,
                error,
                createBooking,
                getBookingDetails,
                cancelBooking,
                fetchUserBookings,
                setError
            }}
        >
            {children}
        </BookingContext.Provider>
    );
};
