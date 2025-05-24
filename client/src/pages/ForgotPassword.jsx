import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
    return (
        <div className="auth-container">
            <ForgotPasswordForm />
            <div className="auth-links">
                <p>
                    Remember your password?{' '}
                    <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
