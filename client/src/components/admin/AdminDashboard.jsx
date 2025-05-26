import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { FaUsers, FaCalendarAlt, FaTicketAlt, FaChartLine } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalBookings: 0,
        activeEvents: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [usersData, eventsData] = await Promise.all([
                userService.getAllUsers(),
                eventService.getAllEvents()
            ]);

            // Calculate stats
            const totalUsers = usersData.length;
            const totalEvents = eventsData.length;
            const activeEvents = eventsData.filter(event => event.status === 'approved').length;
            const totalBookings = eventsData.reduce((sum, event) => sum + (event.bookings?.length || 0), 0);

            setStats({
                totalUsers,
                totalEvents,
                totalBookings,
                activeEvents
            });

            // Get recent users (last 5)
            setRecentUsers(usersData.slice(-5).reverse());

            // Get recent events (last 5)
            setRecentEvents(eventsData.slice(-5).reverse());

        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-profile">
                    <div className="profile-image">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} />
                        ) : (
                            <div className="profile-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <h2>Welcome, {user.name}</h2>
                        <p>System Administrator</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaCalendarAlt className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Events</h3>
                        <p>{stats.totalEvents}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaTicketAlt className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Bookings</h3>
                        <p>{stats.totalBookings}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaChartLine className="stat-icon" />
                    <div className="stat-info">
                        <h3>Active Events</h3>
                        <p>{stats.activeEvents}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="recent-users">
                    <h3>Recent Users</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td className="user-cell">
                                            <div className="user-avatar">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span>{user.name}</span>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="recent-events">
                    <h3>Recent Events</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Organizer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEvents.map(event => (
                                    <tr key={event._id}>
                                        <td className="event-cell">
                                            {event.image && (
                                                <img src={event.image.url} alt={event.title} className="event-thumbnail" />
                                            )}
                                            <span>{event.title}</span>
                                        </td>
                                        <td>{event.organizer.name}</td>
                                        <td>{new Date(event.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${event.status}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 