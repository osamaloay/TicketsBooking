import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="layout">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <Link to="/">Ticketiez</Link>
                </div>
                <div className="nav-links">
                    {/* Placeholder nav items */}
                    <Link to="/">Home</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
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
                <aside className="sidebar">
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
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
