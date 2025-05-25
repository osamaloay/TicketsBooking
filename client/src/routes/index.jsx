import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/events.css';
import Layout from '../components/Layout/Layout';

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
import BookingDetails from '../components/bookings/BookingDetails'

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
            {/* Public routes with layout */}
            <Route path="/" element={
                <Layout>
                    <EventList />
                </Layout>
            } />
            <Route path="/events" element={
                <Layout>
                    <EventList />
                </Layout>
            } />
            <Route path="/events/:id" element={
                <Layout>
                    <EventDetails />
                </Layout>
            } />
            
            {/* Auth routes without layout */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
            <Route path="/verify" element={!isAuthenticated ? <OTPVerification /> : <Navigate to="/" />} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
                <Layout>
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/payment/:id" element={
                <Layout>
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/bookings" element={
                <Layout>
                    <ProtectedRoute>
                        <Bookings />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/bookings/:id" element={
                <Layout>
                    <ProtectedRoute>
                        <BookingDetails />
                    </ProtectedRoute>
                </Layout>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
