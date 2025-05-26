import React, { memo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaHome, FaCalendarAlt, FaInfoCircle, FaEnvelope, FaBars, FaTimes, FaPlus, FaChartBar, FaEdit, FaUsers, FaCog } from 'react-icons/fa';
import './Layout.css';

const Layout = memo(({ children }) => {
    const { isAuthenticated, user, role, ROLES } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const renderNavLinks = () => {
        // Common links for all users
        const commonLinks = [
            { to: '/', icon: <FaHome />, text: 'Home' }
        ];

        // Add Events link only for non-organizers and non-admins
        if (role !== ROLES.ORGANIZER && role !== ROLES.ADMIN && role !== ROLES.USER) {
            commonLinks.push({ to: '/events', icon: <FaCalendarAlt />, text: 'Events' });
        }

        // Role-specific links
        const roleLinks = {
            [ROLES.USER]: [
                { to: '/bookings', icon: <FaTicketAlt />, text: 'My Bookings' }
            ],
            [ROLES.ORGANIZER]: [
                { to: '/my-events/new', icon: <FaPlus />, text: 'Create Event' },
                { to: '/my-events/overview', icon: <FaChartBar />, text: 'Analytics' }
            ],
            [ROLES.ADMIN]: [
                { to: '/admin/dashboard', icon: <FaChartBar />, text: 'Dashboard' },
                { to: '/admin/users', icon: <FaUsers />, text: 'Manage Users' },
                { to: '/admin/events', icon: <FaCalendarAlt />, text: 'Manage Events' }
            ]
        };

        // Combine common links with role-specific links
        const allLinks = [...commonLinks];
        if (isAuthenticated && roleLinks[role]) {
            // For organizers, replace Home with My Events
            if (role === ROLES.ORGANIZER) {
                allLinks[0] = { to: '/my-events', icon: <FaCalendarAlt />, text: 'My Events' };
            }
            // For admins, replace Home with Dashboard
            if (role === ROLES.ADMIN) {
                allLinks[0] = { to: '/admin/dashboard', icon: <FaChartBar />, text: 'Dashboard' };
            }
            allLinks.push(...roleLinks[role]);
        }

        return allLinks.map((link, index) => (
            <Link key={index} to={link.to} className="nav-link">
                {link.icon} {link.text}
            </Link>
        ));
    };

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
                <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    {renderNavLinks()}
                </div>
                <div className="nav-auth">
                    {isAuthenticated ? (
                        <div className="auth-dropdown">
                            <Link to="/profile" className="nav-link">
                                <FaUser /> {user?.name || 'Profile'}
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-link">
                            <FaUser /> Login
                        </Link>
                    )}
                </div>
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
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
                        
                        {/* Admin Quick Actions */}
                        {isAuthenticated && role === ROLES.ADMIN && (
                            <>
                                <h3>Quick Actions</h3>
                                <ul>
                                    <li>
                                        <Link to="/admin/users">
                                            <FaUsers className="icon" /> Manage Users
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/events">
                                            <FaCalendarAlt className="icon" /> Manage Events
                                        </Link>
                                    </li>
                                </ul>
                            </>
                        )}
                        
                        {/* Organizer Quick Actions */}
                        {isAuthenticated && role === ROLES.ORGANIZER && (
                            <>
                                <h3>Quick Actions</h3>
                                <ul>
                                    <li>
                                        <Link to="/my-events/new">
                                            <FaPlus className="icon" /> Create Event
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-events">
                                            <FaCalendarAlt className="icon" /> My Events
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-events/overview">
                                            <FaChartBar className="icon" /> View Analytics
                                        </Link>
                                    </li>
                                </ul>
                            </>
                        )}
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