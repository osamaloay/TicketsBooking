import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
    return (
        <div className="auth-container">
            <LoginForm />
            <div className="auth-links">
                <p>
                    Don't have an account?{' '}
                    <Link to="/register">Register here</Link>
                </p>
                <p>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
