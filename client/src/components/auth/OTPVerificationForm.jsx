import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {Button} from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useLocation } from 'react-router-dom';

const OTPVerificationForm = () => {
    const { type, email } = useLocation().state || {};
    const { verifyOTPLogin, verifyOTPRegister, verifyOTPForgotPassword } = useAuth();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            console.log('Verifying OTP for type:', type);
            switch (type) {
                case 'login':
                    await verifyOTPLogin(otp);
                    break;
                case 'register':
                    await verifyOTPRegister(otp);
                    break;
                case 'forgot-password':
                    await verifyOTPForgotPassword(otp);
                    break;
                default:
                    throw new Error('Invalid verification type');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Verify OTP</h2>
            <p>Enter the OTP sent to {email}</p>
            
            <div className="form-group">
                <label htmlFor="otp">OTP</label>
                <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
            </div>

            {error && <ErrorMessage message={error} />}

            <Button type="submit" variant="primary" fullWidth>
                Verify OTP
            </Button>
        </form>
    );
};

export default OTPVerificationForm;
