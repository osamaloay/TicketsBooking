import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, role } = useAuth();

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles is empty, allow all authenticated users
    if (allowedRoles.length === 0) {
        return <Outlet />;
    }

    // If user's role is not in allowedRoles, redirect to home
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // If user is authenticated and has the correct role, render the route
    return <Outlet />;
};

export default ProtectedRoute; 