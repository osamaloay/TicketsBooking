import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Events Review Section */}
      <section className="events-review">
        <div className="events-container">
          <h2>Featured Events</h2>
          <div className="events-grid">
            {/* Placeholder for events - will be populated with real data later */}
            <div className="event-card">
              <div className="event-image">
                <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Event" />
              </div>
              <div className="event-info">
                <h3>Summer Music Festival</h3>
                <p className="date">June 15, 2024</p>
                <p className="location">Central Park, NY</p>
              </div>
            </div>
            <div className="event-card">
              <div className="event-image">
                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Event" />
              </div>
              <div className="event-info">
                <h3>Jazz Night</h3>
                <p className="date">June 20, 2024</p>
                <p className="location">Blue Note, NY</p>
              </div>
            </div>
            <div className="event-card">
              <div className="event-image">
                <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Event" />
              </div>
              <div className="event-info">
                <h3>Rock Concert</h3>
                <p className="date">June 25, 2024</p>
                <p className="location">Madison Square Garden</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Auth Buttons Section */}
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
    </div>
  );
};

export default Home; 