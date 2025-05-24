import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {Button} from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

const OTPVerificationForm = ({ type = 'login' }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState(null);
    const { 
        verifyOTPLogin, 
        verifyOTPRegister, 
        verifyOTPForgotPassword,
        verifyLoading,
        pendingUser 
    } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
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
            setError(error.response?.data?.message || 'Verification failed');
        }
    };

    if (verifyLoading) return <LoadingSpinner />;

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Verify Your Email</h2>
                <p className="verification-message">
                    We've sent a verification code to {pendingUser?.email}
                </p>

                {error && <ErrorMessage message={error} />}

                <div className="form-group">
                    <label htmlFor="otp">Enter Verification Code</label>
                    <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                    />
                </div>

                <Button type="submit" variant="primary" fullWidth>
                    Verify
                </Button>
            </form>
        </div>
    );
};

export default OTPVerificationForm;
