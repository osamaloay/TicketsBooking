import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/events.css';
import Layout from '../components/Layout/Layout';
import ProfilePage from '../components/profile/ProfilePage';

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
import MyEventsPage from '../components/events/MyEventsPage'
import EventForm from '../components/events/EventForm'
import EventAnalytics from '../components/events/EventAnalytics'

// Payment Components
import Payment from '../components/payment/Payment'

// Booking Components
import Bookings from '../components/bookings/Bookings'
import BookingDetails from '../components/bookings/BookingDetails'

// Auth pages
// import LoginPage from '../pages/auth/LoginPage';
// import RegisterPage from '../pages/auth/RegisterPage';
// import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
// import OTPVerificationPage from '../pages/auth/OTPVerificationPage';

// Main pages
// import HomePage from '../pages/HomePage';
// import EventsPage from '../pages/EventsPage';
// import EventDetailsPage from '../pages/EventDetailsPage';
// import MyBookingsPage from '../pages/MyBookingsPage';

// Admin pages
import AdminEventsPage from '../components/admin/AdminEventsPage';
import AdminUsersPage from '../components/admin/AdminUsersPage';
import AdminSettingsPage from '../components/admin/AdminSettingsPage';
import AdminDashboard from '../components/admin/AdminDashboard';

// Protected Route Component with role-based access
const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, ROLES } = useAuth()

    if (!isAuthenticated) {
        // Store the current path for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        return <Navigate to="/login" />
    }

    // If roles is specified, check user role
    if (roles.length > 0 && !roles.includes(user.role)) {
        console.log('Role check failed:', { userRole: user.role, requiredRoles: roles });
        return <Navigate to="/" />
    }

    return children
}

const AppRoutes = () => {
    const { isAuthenticated, user, ROLES } = useAuth();

    // Determine the home page based on user role
    const getHomePage = () => {
        if (!isAuthenticated) return <EventList />;
        
        switch (user.role) {
            case ROLES.ORGANIZER:
                return <MyEventsPage />;
            case ROLES.ADMIN:
                return <AdminDashboard />;
            default:
                return <EventList />;
        }
    };

    return (
        <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={
                <Layout>
                    {getHomePage()}
                </Layout>
            } />
            
            {/* Event routes */}
            <Route path="/events" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.USER]}>
                        <EventList />
                    </ProtectedRoute>
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
            
            {/* Organizer routes */}
            <Route path="/my-events" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ORGANIZER]}>
                        <MyEventsPage />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/my-events/new" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ORGANIZER]}>
                        <EventForm />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/my-events/overview" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ORGANIZER]}>
                        <EventAnalytics />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/my-events/:id/edit" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ORGANIZER]}>
                        <EventForm />
                    </ProtectedRoute>
                </Layout>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/admin/events" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                        <AdminEventsPage />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/admin/users" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                        <AdminUsersPage />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/admin/settings" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                        <AdminSettingsPage />
                    </ProtectedRoute>
                </Layout>
            } />
            
            {/* Other protected routes */}
            <Route path="/payment/:id" element={
                <Layout>
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                </Layout>
            } />
            <Route path="/bookings" element={
                <Layout>
                    <ProtectedRoute roles={[ROLES.USER]}>
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
            <Route path="/profile" element={
                <Layout>
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                </Layout>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
