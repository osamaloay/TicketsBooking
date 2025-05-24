import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '../../services/eventService';
import './EditEvent.css';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    ticketPrice: '',
    availableTickets: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    if (!id) {
      toast.error('Event ID is missing');
      navigate('/organizer-dashboard');
      return;
    }
    fetchEventDetails();
  }, [id, navigate]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching event details for ID:', id); // Debug log
      
      const eventData = await eventService.getEventById(id);
      console.log('Received event data:', eventData); // Debug log

      if (!eventData) {
        throw new Error('No event data received');
      }

      // Format the date for the input field (YYYY-MM-DD)
      const formattedDate = eventData.date 
        ? new Date(eventData.date).toISOString().split('T')[0]
        : '';

      // Format the time if it exists
      const formattedTime = eventData.time || '';

      setEvent({
        ...eventData,
        date: formattedDate,
        time: formattedTime,
        ticketPrice: eventData.ticketPrice?.toString() || '',
        availableTickets: eventData.availableTickets?.toString() || ''
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error(error.message || 'Failed to load event details');
      navigate('/organizer-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string values to numbers where needed
      const eventDataToSubmit = {
        ...event,
        ticketPrice: parseFloat(event.ticketPrice),
        availableTickets: parseInt(event.availableTickets, 10)
      };

      console.log('Submitting event data:', eventDataToSubmit); // Debug log
      await eventService.updateEvent(id, eventDataToSubmit);
      toast.success('Event updated successfully');
      navigate('/organizer-dashboard');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Failed to update event');
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  return (
    <div className="edit-event-container">
      <h1>Edit Event</h1>
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={event.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={event.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={event.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={event.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={event.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ticketPrice">Ticket Price ($)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={event.ticketPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="availableTickets">Available Tickets</label>
            <input
              type="number"
              id="availableTickets"
              name="availableTickets"
              value={event.availableTickets}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={event.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Arts">Arts</option>
            <option value="Food">Food</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={event.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/organizer-dashboard')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
