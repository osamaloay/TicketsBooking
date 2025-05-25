import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/events';

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" />
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
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
