import React, { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import OTPVerificationForm from '../components/auth/OTPVerificationForm';
import { useAuth } from '../context/AuthContext';

const OTPVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pendingUser, isAuthenticated } = useAuth();

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // If no pending user, redirect to login
    if (!pendingUser) {
        return <Navigate to="/login" replace />;
    }

    // Get verification type from location state
    const type = location.state?.type || 'login';

    return <OTPVerificationForm type={type} />;
};

export default OTPVerification;
