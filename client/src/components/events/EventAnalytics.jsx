import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './EventAnalytics.css';

const EventAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const response = await userService.getOrganizerEventsAnalytics();
            setAnalytics(response);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to fetch event analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="analytics-loading">Loading analytics...</div>;
    }

    const chartData = analytics.map(event => ({
        name: event.eventTitle,
        ticketsSold: event.totalTicketsSold,
        totalTickets: event.totalTickets,
        revenue: event.totalRevenue,
        percentageBooked: event.percentageBooked
    }));

    return (
        <div className="analytics-container">
            <h2>Event Analytics</h2>
            
            <div className="analytics-summary">
                <div className="summary-card">
                    <h3>Total Events</h3>
                    <p>{analytics.length}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p>${analytics.reduce((sum, event) => sum + event.totalRevenue, 0).toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Tickets Sold</h3>
                    <p>{analytics.reduce((sum, event) => sum + event.totalTicketsSold, 0)}</p>
                </div>
            </div>

            <div className="chart-container">
                <h3>Tickets Sold vs Total Tickets</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ticketsSold" name="Tickets Sold" fill="#8884d8" />
                        <Bar dataKey="totalTickets" name="Total Tickets" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-container">
                <h3>Booking Percentage</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="percentageBooked" name="Percentage Booked" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="analytics-table">
                <h3>Detailed Analytics</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Tickets Sold</th>
                            <th>Total Tickets</th>
                            <th>Percentage Booked</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.map((event) => (
                            <tr key={event.eventId}>
                                <td>{event.eventTitle}</td>
                                <td>{event.totalTicketsSold}</td>
                                <td>{event.totalTickets}</td>
                                <td>{event.percentageBooked}%</td>
                                <td>${event.totalRevenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventAnalytics; 