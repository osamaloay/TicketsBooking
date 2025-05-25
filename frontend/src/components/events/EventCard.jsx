import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa'; 
import './EventCard.css'; 
 
const EventCard = ({ event }) => { 
  const navigate = useNavigate(); 
 
  const formatDate = (dateString) => { 
    const options = {  
      year: 'numeric',  
      month: 'long',  
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }; 
    return new Date(dateString).toLocaleDateString('en-US', options); 
  }; 
 
  const handleEventClick = () => { 
    console.log('Event ID:', event._id); // Debug log 
    navigate(`/events/${event._id}`); 
  }; 
 
  return ( 
    <div className="event-card" onClick={handleEventClick}> 
      <div className="event-image-container"> 
        <img  
          src={event.image || 'https://via.placeholder.com/400x200?text=Event+Image'}  
          alt={event.title}  
          className="event-image"  
        /> 
        <div className={`status-badge ${event.status.toLowerCase()}`}> 
          {event.status} 
        </div> 
        {event.remainingTickets <= 10 && event.remainingTickets > 0 && ( 
          <div className="ticket-warning"> 
            Only {event.remainingTickets} tickets left! 
          </div> 
        )} 
        {event.remainingTickets === 0 && ( 
          <div className="sold-out-badge">Sold Out</div> 
        )} 
      </div> 
      <div className="event-content"> 
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p> 
        <div className="event-details"> 
          <div className="detail-item"> 
            <FaCalendarAlt className="icon" /> 
            <span>{formatDate(event.date)}</span>  
          </div> 
          <div className="detail-item"> 
            <FaMapMarkerAlt className="icon" /> 
            <span>{event.location}</span> 
          </div> 
          <div className="detail-item"> 
            <FaTicketAlt className="icon" /> 
            <span>{event.remainingTickets} tickets left</span> 
          </div> 
        </div> 
        <div className="event-footer"> 
          <span className="event-price">${event.ticketPricing}</span> 
          <button  
            className="view-details-button" 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleEventClick(); 
            }} 
          > 
            View Details 
          </button> 
        </div> 
      </div> 
    </div>  
  ); 
}; 
 
export default  EventCard;     