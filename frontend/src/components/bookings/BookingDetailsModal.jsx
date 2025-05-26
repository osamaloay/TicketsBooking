import React from 'react';
import './BookingDetailsModal.css';

const BookingDetailsModal = ({ booking, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-header">
          <h2>Booking Details</h2>
          <span className={`booking-status ${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
        </div>

        <div className="modal-body">
          <div className="event-details">
            <h3>{booking.event.title}</h3>
            <div className="detail-row">
              <i className="fas fa-calendar-alt"></i>
              <span>Date: {new Date(booking.event.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <i className="fas fa-clock"></i>
              <span>Time: {new Date(booking.event.date).toLocaleTimeString()}</span>
            </div>
            <div className="detail-row">
              <i className="fas fa-map-marker-alt"></i>
              <span>Location: {booking.event.location}</span>
            </div>
          </div>

          <div className="booking-info">
            <h4>Booking Information</h4>
            <div className="detail-row">
              <i className="fas fa-hashtag"></i>
              <span>Booking ID: {booking._id}</span>
            </div>
            <div className="detail-row">
              <i className="fas fa-ticket-alt"></i>
              <span>Number of Tickets: {booking.quantity}</span>
            </div>
            <div className="detail-row">
              <i className="fas fa-dollar-sign"></i>
              <span>Price per Ticket: ${booking.event.ticketPrice}</span>
            </div>
            <div className="detail-row total">
              <i className="fas fa-money-bill-wave"></i>
              <span>Total Amount: ${booking.totalAmount}</span>
            </div>
          </div>

          <div className="booking-timeline">
            <h4>Booking Timeline</h4>
            <div className="timeline">
              <div className="timeline-item">
                <i className="fas fa-calendar-check"></i>
                <div className="timeline-content">
                  <h5>Booking Created</h5>
                  <p>{new Date(booking.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {booking.updatedAt && (
                <div className="timeline-item">
                  <i className="fas fa-clock"></i>
                  <div className="timeline-content">
                    <h5>Last Updated</h5>
                    <p>{new Date(booking.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 