import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

const ForgotPasswordForm = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (error) {
            setError(error.message);
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
                <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => setSuccess(false)}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Forgot Password</h2>
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
