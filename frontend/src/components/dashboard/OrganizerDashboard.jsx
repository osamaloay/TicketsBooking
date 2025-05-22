import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '../../services/eventService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './OrganizerDashboard.css';
import EventAnalytics from './EventAnalytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events...'); // Debug log
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token); // Debug log
      
      const events = await eventService.getOrganizerEvents();
      console.log('Fetched events:', events); // Debug log
      
      if (!Array.isArray(events)) {
        console.error('Received non-array response:', events);
        throw new Error('Invalid response format from server');
      }
      
      setEvents(events);
      console.log('Events state updated:', events.length, 'events'); // Debug log
    } catch (error) {
      console.error('Error fetching events:', error); // Debug log
      toast.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error(error.message || 'Failed to delete event');
      }
    }
  };

  const handleViewAnalytics = async (eventId) => {
    try {
      const analytics = await eventService.getEventAnalytics(eventId);
      setAnalytics(analytics);
      setSelectedEvent(eventId);
    } catch (error) {
      toast.error(error.message || 'Failed to load analytics');
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

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Your event has been approved and is now live';
      case 'pending':
        return 'Your event is pending admin approval';
      case 'rejected':
        return 'Your event has been rejected';
      default:
        return 'Status unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✓';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '✕';
      default:
        return '?';
    }
  };

  const filteredEvents = events.filter(event => {
    console.log('Filtering event:', {
      id: event._id,
      title: event.title,
      status: event.status,
      filter: filter
    });
    
    if (filter === 'all') return true;
    
    // Normalize both the event status and filter to lowercase
    const eventStatus = (event.status || '').toLowerCase().trim();
    const filterStatus = filter.toLowerCase().trim();
    
    const matches = eventStatus === filterStatus;
    console.log('Event matches filter:', matches, {
      eventStatus,
      filterStatus
    });
    return matches;
  });

  useEffect(() => {
    console.log('Filter changed to:', filter);
    console.log('Current events:', events);
    console.log('Filtered events:', filteredEvents);
  }, [filter, events]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="organizer-dashboard">
      <h1>Organizer Dashboard</h1>
      
      {/* Add the EventAnalytics component */}
      <EventAnalytics />
      
      <div className="events-section">
        <div className="events-header">
          <h2>Your Events</h2>
          <div className="header-actions">
            <button className="create-event-button" onClick={handleCreateEvent}>
              Create New Event
            </button>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All Events
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''} 
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={filter === 'approved' ? 'active' : ''} 
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button 
                className={filter === 'rejected' ? 'active' : ''} 
                onClick={() => setFilter('rejected')}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            <p>You haven't created any events yet.</p>
            <button onClick={handleCreateEvent}>Create Event</button>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="status-container">
                    <span className={getStatusBadgeClass(event.status)}>
                      <span className="status-icon">{getStatusIcon(event.status)}</span>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="event-details">
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Tickets:</strong> {event.remainingTickets} available</p>
                  <p className="status-message">{getStatusMessage(event.status)}</p>
                  {event.status === 'rejected' && event.rejectionReason && (
                    <p className="rejection-reason">
                      <strong>Rejection Reason:</strong> {event.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="event-actions">
                  {event.status !== 'rejected' && (
                    <button onClick={() => handleEditEvent(event._id)}>Edit</button>
                  )}
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {analytics && selectedEvent && (
        <div className="analytics-section">
          <h2>Event Analytics</h2>
          <div className="analytics-card">
            <Line
              data={{
                labels: analytics.labels,
                datasets: [
                  {
                    label: 'Tickets Booked',
                    data: analytics.ticketData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Ticket Booking Progress'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Tickets'
                    }
                  }
                }
              }}
            />
            <div className="analytics-summary">
              <h3>Summary</h3>
              <p>Total Tickets Sold: {analytics.totalTicketsSold}</p>
              <p>Revenue: ${analytics.revenue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard; 