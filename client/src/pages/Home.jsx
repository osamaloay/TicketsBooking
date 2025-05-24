import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <div className="home-container">
            <div className="home-content">
                <h1>Welcome to Ticketiez</h1>
                <p className="welcome-message">
                    Hello, {user?.name || 'User'}!
                </p>
                <div className="home-actions">
                    <button 
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
