import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

const OTPVerificationForm = () => {
    const { verifyOTPLogin, verifyOTPRegister, verifyOTPForgotPassword, verifyLoading } = useAuth();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    // Get verification type and email from location state
    const { type, email } = location.state || {};
    
    console.log('OTPVerificationForm location state:', location.state);
    console.log('OTPVerificationForm type:', type);
    console.log('OTPVerificationForm email:', email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!type || !email) {
            setError('Missing verification information');
            return;
        }

        // Validate passwords match for forgot password flow
        if ((type === 'forgot' || type === 'forgot-password') && newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            switch (type) {
                case 'login':
                    await verifyOTPLogin(otp);
                    break;
                case 'register':
                    await verifyOTPRegister(otp);
                    break;
                case 'forgot':
                case 'forgot-password':
                    // Only send what the backend expects
                    await verifyOTPForgotPassword({ 
                        email, 
                        otp, 
                        newPassword 
                    });
                    break;
                default:
                    setError('Invalid verification type');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.message || error.message || 'Verification failed');
        }
    };

    if (verifyLoading) return <LoadingSpinner />;

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Verify OTP</h2>
            {error && <ErrorMessage message={error} />}
            
            <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="Enter the OTP sent to your email"
                />
            </div>

            {(type === 'forgot' || type === 'forgot-password') && (
                <>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                        />
                    </div>
                </>
            )}

            <Button type="submit" variant="primary" fullWidth>
                Verify
            </Button>
        </form>
    );
};

export default OTPVerificationForm;
