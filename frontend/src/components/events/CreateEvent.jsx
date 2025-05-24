import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '../../services/eventService';
import ImageUpload from '../shared/ImageUpload';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'concert',
    image: '',
    ticketPrice: '',
    totalTickets: '',
    remainingTickets: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (imageUrl) => {
    console.log('Image selected:', imageUrl); // Debug log
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.image) {
        toast.error('Please upload an event image');
        setLoading(false);
        return;
      }

      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(),
        location: formData.location,
        category: formData.category,
        image: formData.image, // This should already be the URL from the image upload
        ticketPrice: parseFloat(formData.ticketPrice),
        totalTickets: parseInt(formData.totalTickets),
        remainingTickets: parseInt(formData.totalTickets) // Initially same as total tickets
      };

      console.log('Submitting event data:', eventData);
      const response = await eventService.createEvent(eventData);
      console.log('Server response:', response);
      
      toast.success('Event created successfully!');
      navigate('/organizer-dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
        <h1>Create New Event</h1>
      <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
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
                value={formData.date}
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
                value={formData.time}
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
              value={formData.location}
              onChange={handleChange}
              required
          />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="theater">Theater</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
          <label>Event Image</label>
          <ImageUpload 
            onImageSelect={handleImageSelect}
            currentImage={formData.image}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ticketPrice">Ticket Price ($)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalTickets">Total Tickets</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
          {loading ? 'Creating Event...' : 'Create Event'}
            </button>
        </form>
    </div>
  );
};

export default CreateEvent; 