import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('Submitting forgot password for:', email);
            const response = await forgotPassword(email);
            console.log('Forgot password response:', response);
            setSuccess(true);
            
            // Navigate after a short delay
            setTimeout(() => {
                navigate('/verify', { 
                    state: { 
                        type: 'forgot-password',
                        email: email 
                    } 
                });
            }, 2000);
        } catch (error) {
            console.error('Forgot password error:', error);
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (success) {
        return (
            <div className="auth-form">
                <h2>Check Your Email</h2>
                <p>We've sent a password reset OTP to {email}</p>
                <p>Please wait while we redirect you...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a password reset OTP</p>
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" variant="primary" fullWidth>
                Send Reset OTP
            </Button>
        </form>
    );
};

export default ForgotPasswordForm;
