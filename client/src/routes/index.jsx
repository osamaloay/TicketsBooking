import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/events.css';

// Pages
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import OTPVerification from '../pages/OTPVerification'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'

// Event Components
import EventList from '../components/events/EventList'
import EventDetails from '../components/events/EventDetails'

// Payment Components
import Payment from '../components/payment/Payment'

// Booking Components
import Bookings from '../components/bookings/Bookings'

// Protected Route Component with role-based access
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated) {
        // Store the current path for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        return <Navigate to="/login" />
    }

    // If allowedRoles is specified, check user role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />
    }

    return children
}

const AppRoutes = () => {
    const { isAuthenticated } = useAuth()

    return (
        <Routes>
            {/* Public routes - Always accessible */}
            <Route path="/" element={<EventList />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            
            {/* Auth routes - Redirect to home if already authenticated */}
            <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
            />
            <Route 
                path="/forgot-password" 
                element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} 
            />
            <Route 
                path="/verify" 
                element={isAuthenticated ? <Navigate to="/" /> : <OTPVerification />} 
            />
            
            {/* Protected routes - Authentication required */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/payment/:id" 
                element={
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/bookings" 
                element={
                    <ProtectedRoute>
                        <Bookings />
                    </ProtectedRoute>
                } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
