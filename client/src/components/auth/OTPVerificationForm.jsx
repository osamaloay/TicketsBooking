import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useLocation } from 'react-router-dom';

const OTPVerificationForm = () => {
    const { type, email } = useLocation().state || {};
    const { verifyOTPLogin, verifyOTPRegister, verifyOTPForgotPassword } = useAuth();
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

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
                    if (password !== confirmPassword) {
                        setError("Passwords don't match");
                        return;
                    }
                    await verifyOTPForgotPassword({ email, otp, newPassword: password });
                    break;
                default:
                    throw new Error('Invalid verification type');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

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

            {type === 'forgot-password' && (
                <>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
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
                            minLength="6"
                        />
                    </div>
                </>
            )}

            {error && <ErrorMessage message={error} />}

            <Button type="submit" variant="primary" fullWidth>
                {type === 'forgot-password' ? 'Reset Password' : 'Verify OTP'}
            </Button>
        </form>
    );
};

export default OTPVerificationForm;
