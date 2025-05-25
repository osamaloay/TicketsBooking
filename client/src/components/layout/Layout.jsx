import React, { memo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaHome, FaCalendarAlt, FaInfoCircle, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import './Layout.css';

const Layout = memo(({ children }) => {
    const { isAuthenticated, isUser, role, ROLES } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Add these console logs for debugging
    console.log('Layout - isAuthenticated:', isAuthenticated);
    console.log('Layout - isUser:', isUser);
    console.log('Layout - role:', role);
    console.log('Layout - ROLES:', ROLES);

    return (
        <div className="layout">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <Link to="/">Ticketiez</Link>
                </div>
                <div className="nav-links">
                    <Link to="/" className="nav-link">
                        <FaHome className="icon" /> Home
                    </Link>
                    <Link to="/events" className="nav-link">
                        <FaCalendarAlt className="icon" /> Events
                    </Link>
                    <Link to="/about" className="nav-link">
                        <FaInfoCircle className="icon" /> About
                    </Link>
                    <Link to="/contact" className="nav-link">
                        <FaEnvelope className="icon" /> Contact
                    </Link>
                    {isAuthenticated && role === ROLES.USER && (
                        <Link to="/bookings" className="nav-link">
                            <FaTicketAlt className="icon" /> My Bookings
                        </Link>
                    )}
                </div>
                <div className="auth-icon">
                    {!isAuthenticated ? (
                        <div className="auth-dropdown">
                            <FaUser className="user-icon" />
                            <div className="dropdown-content">
                                <Link to="/login">Login</Link>
                                <Link to="/register">Sign Up</Link>
                            </div>
                        </div>
                    ) : (
                        <Link to="/dashboard">
                            <FaUser className="user-icon" />
                        </Link>
                    )}
                </div>
            </nav>

            <div className="layout-content">
                {/* Sidebar */}
                <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-content">
                        <h3>Categories</h3>
                        <ul>
                            <li><Link to="/events?category=music">Music</Link></li>
                            <li><Link to="/events?category=sports">Sports</Link></li>
                            <li><Link to="/events?category=arts">Arts</Link></li>
                            <li><Link to="/events?category=technology">Technology</Link></li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
});

Layout.displayName = 'Layout';

export default Layout;
