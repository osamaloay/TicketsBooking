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
            {/* Public Routes */}
            <Route path="/" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
            <Route path="/verify" element={!isAuthenticated ? <OTPVerification /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            } />

            {/* Payment Route - Only for Standard Users */}
            <Route path="/payment/:id" element={
                <ProtectedRoute allowedRoles={['Standard User']}>
                    <Payment />
                </ProtectedRoute>
            } />

            {/* Bookings Route - Only for Standard Users */}
            <Route path="/bookings" element={
                <ProtectedRoute allowedRoles={['Standard User']}>
                    <Bookings />
                </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
