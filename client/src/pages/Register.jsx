import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
    return (
        <div className="auth-container">
            <RegisterForm />
            <div className="auth-links">
                <p>
                    Already have an account?{' '}
                    <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
