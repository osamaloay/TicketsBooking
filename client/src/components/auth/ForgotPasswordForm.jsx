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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('Submitting forgot password for:', email);
            const response = await forgotPassword(email);
            console.log('Forgot password response:', response);
            
            // Add console log to verify state
            console.log('Navigating to verify with state:', {
                type: 'forgot-password',
                email: email
            });
            
            // Navigate immediately after successful response
            navigate('/verify', { 
                state: { 
                    type: 'forgot-password',
                    email: email 
                },
                replace: true // Add this to replace the current history entry
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

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
