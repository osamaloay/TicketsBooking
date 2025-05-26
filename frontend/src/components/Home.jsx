import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeaturedEvents from './events/FeaturedEvents';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Dashboard Button for logged-in users */}
      {user && (
        <div className="dashboard-button-container">
          <button 
            className="dashboard-button"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i> Back to Dashboard
          </button>
        </div>
      )}

      {/* Featured Events Section */}
      <FeaturedEvents />

      {/* Hero Section with Categories */}
      <section className="hero">
        <h1>Welcome to TicketNest</h1>
        <p>Your one-stop platform for event tickets</p>
        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-4">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/events/music" className="category-tag">
              <i className="fas fa-music mr-2"></i>
              Music
            </Link>
            <Link to="/events/sports" className="category-tag">
              <i className="fas fa-futbol mr-2"></i>
              Sports
            </Link>
            <Link to="/events/arts" className="category-tag">
              <i className="fas fa-palette mr-2"></i>
              Arts
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Buttons Section - Only show if user is not logged in */}
      {!user && (
        <section className="auth-section">
          <div className="auth-container">
            <h2>Join Our Community</h2>
            <p>Create an account or sign in to start booking events</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-button primary">
                <i className="fas fa-user-plus mr-2"></i>
                Register Now
              </Link>
              <Link to="/login" className="cta-button secondary">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 