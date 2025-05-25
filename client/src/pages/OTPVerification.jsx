import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import OTPVerificationForm from '../components/auth/OTPVerificationForm';

const OTPVerification = () => {
    const location = useLocation();
    
    // Debug logs
    console.log('OTPVerification page - Location state:', location.state);
    
    // If no state is present, redirect to forgot-password
    if (!location.state || !location.state.type || !location.state.email) {
        console.log('No state in OTPVerification, redirecting to forgot-password');
        return <Navigate to="/forgot-password" replace />;
    }

    return <OTPVerificationForm />;
};

export default OTPVerification;
