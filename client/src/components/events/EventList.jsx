// client/src/components/events/EventList.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaSearch, FaFilter } from 'react-icons/fa';
import './EventList.css';

const EventList = () => {
    const { 
        events, 
        loading, 
        error, 
        fetchEvents,
        searchEvents
    } = useEvent();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [sortBy, setSortBy] = useState('date_asc');
    const [filters, setFilters] = useState({
        categories: [],
        priceRanges: [],
        sortOptions: []
    });
    const [showFilters, setShowFilters] = useState(false);

    // Use useCallback to memoize the fetchEvents call
    const loadEvents = useCallback(async () => {
        if (events.length === 0) {
            const response = await fetchEvents();
            if (response?.filters) {
                setFilters(response.filters);
            }
        }
    }, [events.length, fetchEvents]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const response = await searchEvents({
            q: searchQuery,
            category: selectedCategory,
            date: selectedDate,
            priceRange: selectedPriceRange,
            sortBy
        });
        if (response?.filters) {
            setFilters(response.filters);
        }
    };

    const handleFilterChange = async () => {
        const response = await searchEvents({
            q: searchQuery,
            category: selectedCategory,
            date: selectedDate,
            priceRange: selectedPriceRange,
            sortBy
        });
        if (response?.filters) {
            setFilters(response.filters);
        }
    };

    useEffect(() => {
        handleFilterChange();
    }, [selectedCategory, selectedDate, selectedPriceRange, sortBy]);

    // Show loading spinner only when we have no events and are loading
    if (loading && events.length === 0) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="events-container">
            <div className="events-header">
                <h2>
                    <span className="emoji">🎉</span>
                    Upcoming Events
                    <span className="emoji">🎪</span>
                </h2>
                <p>Discover and book tickets for the most exciting events in town</p>
            </div>

            <div className="search-filter-container">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="button" className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> Filters
                    </button>
                </form>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Category</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {filters.categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <select 
                                value={selectedPriceRange} 
                                onChange={(e) => setSelectedPriceRange(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Prices</option>
                                {filters.priceRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                {filters.sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
            
            {!events || events.length === 0 ? (
                <div className="no-events">
                    <h2>No Events Found</h2>
                    <p>Try adjusting your search filters</p>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map(event => (
                        <Link to={`/events/${event._id}`} key={event._id} className="event-link">
                            <div className="event-card">
                                <div className="event-image-container">
                                    <img 
                                        src={event.image?.url || '/default-event-image.jpg'} 
                                        alt={event.title}
                                        className="event-image"
                                    />
                                </div>
                                
                                <div className="event-info">
                                    <h3 className="event-title">{event.title}</h3>
                                    
                                    <div className="event-details">
                                        <div className="event-detail">
                                            <FaCalendarAlt className="icon" />
                                            <span>{new Date(event.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                        
                                        <div className="event-detail">
                                            <FaMapMarkerAlt className="icon" />
                                            <span>{event.location.address || 'Location not specified'}</span>
                                        </div>
                                        
                                        <div className="event-detail">
                                            <FaTicketAlt className="icon" />
                                            <span>${event.ticketPricing}</span>
                                        </div>
                                        
                                        <div className="event-detail">
                                            <FaUsers className="icon" />
                                            <span className={event.remainingTickets > 0 ? 'available-label' : 'sold-out-label'}>
                                                {event.remainingTickets} tickets left
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="event-footer">
                                        <span className="event-status">
                                            {event.remainingTickets > 0 ? 'Available' : 'Sold Out'}
                                        </span>
                                        <button className="view-details-btn">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;