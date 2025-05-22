import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { eventService } from '../../services/eventService';
import './EventAnalytics.css';

const EventAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await eventService.getUserEventsAnalytics();
            setAnalytics(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message || 'Failed to load analytics data');
            setAnalytics([]);
        } finally {
            setLoading(false);
        }
    };

    // Always render a container to prevent blank page
    return (
        <div className="event-analytics">
            <h2>Event Analytics</h2>
            
            {loading && (
                <div className="analytics-loading">
                    Loading analytics data...
                </div>
            )}

            {error && (
                <div className="analytics-error">
                    <p>{error}</p>
                    <button onClick={fetchAnalytics}>Retry</button>
                </div>
            )}

            {!loading && !error && analytics.length === 0 && (
                <div className="analytics-empty">
                    <p>No analytics data available</p>
                </div>
            )}

            {!loading && !error && analytics.length > 0 && (
                <>
                    <div className="analytics-summary">
                        <div className="summary-card">
                            <h3>Total Events</h3>
                            <p>{analytics.length}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Total Tickets Sold</h3>
                            <p>{analytics.reduce((sum, event) => sum + (event.totalTicketsSold || 0), 0)}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Total Revenue</h3>
                            <p>${analytics.reduce((sum, event) => sum + (event.totalRevenue || 0), 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3>Ticket Sales Overview</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={analytics.map(event => ({
                                    name: event.eventTitle,
                                    ticketsSold: event.totalTicketsSold || 0,
                                    revenue: event.totalRevenue || 0,
                                    percentageBooked: event.percentageBooked || 0
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="ticketsSold"
                                    stroke="#8884d8"
                                    name="Tickets Sold"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#82ca9d"
                                    name="Revenue ($)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="events-table">
                        <h3>Event Details</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Tickets Sold</th>
                                    <th>Total Revenue</th>
                                    <th>Booking Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.map((event, index) => (
                                    <tr key={index}>
                                        <td>{event.eventTitle}</td>
                                        <td>{event.totalTicketsSold || 0}</td>
                                        <td>${(event.totalRevenue || 0).toFixed(2)}</td>
                                        <td>{event.percentageBooked || 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default EventAnalytics; 