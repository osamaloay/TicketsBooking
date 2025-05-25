import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useLocation } from 'react-router-dom';

const OTPVerificationForm = () => {
    const location = useLocation();
    const { type, email } = location.state || {};
    const { verifyOTPLogin, verifyOTPRegister, verifyOTPForgotPassword } = useAuth();
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Add console logs to debug state
    console.log('OTPVerificationForm location state:', location.state);
    console.log('OTPVerificationForm type:', type);
    console.log('OTPVerificationForm email:', email);

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
                        setLoading(false);
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
            setLoading(false);
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
                    disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </>
            )}

            {error && <ErrorMessage message={error} />}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    type === 'forgot-password' ? 'Reset Password' : 'Verify OTP'
                )}
            </Button>
        </form>
    );
};

export default OTPVerificationForm;
