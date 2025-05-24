import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import { eventService } from '../../services/eventService';
import './AdminDashboard.css';
import UserRow from './UserRow';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch dashboard data...');
        
        const [statsResponse, usersResponse] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentUsers()
        ]);
        
        console.log('Stats response:', statsResponse);
        console.log('Users response:', usersResponse);
        
        setStats(statsResponse);
        setRecentUsers(usersResponse || []);
        
        console.log('Updated stats state:', statsResponse);
        console.log('Updated recentUsers state:', usersResponse || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error details:', error.response || error);
        toast.error(error.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending events...');
      const events = await eventService.getPendingEvents();
      console.log('Fetched pending events:', events);
      setPendingEvents(events);
      console.log('Updated pendingEvents state:', events);
    } catch (error) {
      console.error('Error fetching pending events:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching all events...');
      const events = await eventService.getAllEvents();
      console.log('Fetched events:', events);
      setEvents(events);
      // Initialize selected status for each event
      const initialStatus = {};
      events.forEach(event => {
        initialStatus[event._id] = event.status;
      });
      setSelectedStatus(initialStatus);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = (status) => {
    if (!status || status === 'all') {
      return events;
    }
    return events.filter(event => event.status.toLowerCase() === status.toLowerCase());
  };

  const handleStatusFilter = (status) => {
    const filteredEvents = getFilteredEvents(status);
    setEvents(filteredEvents);
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const userDetails = await adminService.getUserDetails(userId);
      navigate(`/admin/users/${userId}`, { state: { user: userDetails } });
    } catch (error) {
      toast.error(error.message || 'Failed to load user details');
    }
  };

  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleCreateEvent = () => {
    navigate('/admin/events/create');
  };

  const handleGenerateReport = async (reportType) => {
    try {
      const report = await adminService.generateReport(reportType, {});
      // Handle the report data (e.g., download or display)
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to generate report');
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await eventService.approveEvent(eventId);
        toast.success('Event approved successfully');
      } else if (newStatus === 'rejected') {
        const reason = window.prompt('Please enter rejection reason:');
        if (reason) {
          await eventService.rejectEvent(eventId, reason);
          toast.success('Event rejected successfully');
        } else {
          return; // User cancelled the rejection
        }
      } else if (newStatus === 'pending') {
        // Add new logic for setting status back to pending
        await eventService.updateEventStatus(eventId, 'pending');
        toast.success('Event status changed to pending');
      }
      
      // Update local state
      setSelectedStatus(prev => ({
        ...prev,
        [eventId]: newStatus
      }));
      
      // Refresh events list
      fetchEvents();
      // Refresh pending events list
      fetchPendingEvents();
    } catch (error) {
      toast.error(error.message || 'Failed to update event status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-badge approved';
      case 'pending':
        return 'status-badge pending';
      case 'rejected':
        return 'status-badge declined';
      default:
        return 'status-badge';
    }
  };

  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setSelectedEvent(null);
    setRejectionReason('');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Events</h3>
            <p className="stat-value">{stats.totalEvents}</p>
          </div>
          <div className="stat-card">
            <h3>Tickets Sold</h3>
            <p className="stat-value">{stats.totalTicketsSold}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>All Users</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onUserUpdate={() => {
                        adminService.getRecentUsers()
                          .then(users => setRecentUsers(users))
                          .catch(error => toast.error(error.message));
                      }}
                      onUserDelete={() => {
                        adminService.getRecentUsers()
                          .then(users => setRecentUsers(users))
                          .catch(error => toast.error(error.message));
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={handleCreateUser}
            >
              Add New User
            </button>
            <button 
              className="action-button"
              onClick={handleCreateEvent}
            >
              Create Event
            </button>
            <button 
              className="action-button"
              onClick={() => handleGenerateReport('sales')}
            >
              Generate Sales Report
            </button>
            <button 
              className="action-button"
              onClick={() => handleGenerateReport('users')}
            >
              Generate User Report
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Pending Events</h2>
          {pendingEvents.length === 0 ? (
            <p>No pending events to review</p>
          ) : (
            <div className="table-container">
              <table className="data-table pending-events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Organizer</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((event) => (
                    <tr key={event._id} className="pending-event-row">
                      <td className="event-name">{event.title}</td>
                      <td className="organizer-name">{event.organizer?.name || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="events-table-container">
          <h2>All Events</h2>
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Location</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.organizer?.name || 'Unknown'}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                  <td>
                    <span className={getStatusBadgeClass(event.status)}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={selectedStatus[event._id] || event.status}
                      onChange={(e) => handleStatusChange(event._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reject Event</h3>
            <p>Please provide a reason for rejecting "{selectedEvent.title}"</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => handleStatusChange(selectedEvent._id, 'rejected')}>Submit</button>
              <button onClick={closeRejectModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 