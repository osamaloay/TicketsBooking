import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import './EventAnalytics.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const EventAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await userService.getOrganizerEventsAnalytics();
                setAnalyticsData(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const getCategoryDistributionData = () => {
        if (!analyticsData || !Array.isArray(analyticsData)) {
            console.log('Analytics data is not available');
            return {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                    hoverOffset: 4,
                }]
            };
        }

        // Count events by category
        const categoryCounts = analyticsData.reduce((acc, event) => {
            if (!event || !event.eventTitle) return acc;
            const category = event.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const categoryColors = {
            music: '#FF6384',
            sports: '#36A2EB',
            arts: '#FFCE56',
            food: '#4BC0C0',
            technology: '#9966FF',
            Uncategorized: '#999999'
        };

        const labels = Object.keys(categoryCounts).map(cat => 
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const data = Object.values(categoryCounts);
        const backgroundColors = Object.keys(categoryCounts).map(cat => 
            categoryColors[cat.toLowerCase()] || '#999999'
        );

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1,
                hoverOffset: 4,
            }]
        };
    };

    const getRevenueData = () => {
        if (!analyticsData || !Array.isArray(analyticsData)) {
            console.log('Analytics data is not available');
            return {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                    hoverOffset: 4,
                }]
            };
        }

        // Calculate revenue by category
        const revenueByCategory = analyticsData.reduce((acc, event) => {
            if (!event || !event.eventTitle) return acc;
            const category = event.category || 'Uncategorized';
            const revenue = event.totalRevenue || 0;
            acc[category] = (acc[category] || 0) + revenue;
            return acc;
        }, {});

        const categoryColors = {
            music: '#FF6384',
            sports: '#36A2EB',
            arts: '#FFCE56',
            food: '#4BC0C0',
            technology: '#9966FF',
            Uncategorized: '#999999'
        };

        const labels = Object.keys(revenueByCategory).map(cat => 
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const data = Object.values(revenueByCategory);
        const backgroundColors = Object.keys(revenueByCategory).map(cat => 
            categoryColors[cat.toLowerCase()] || '#999999'
        );

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1,
                hoverOffset: 4,
            }]
        };
    };

    const getEventPerformanceData = () => {
        if (!analyticsData || !Array.isArray(analyticsData)) {
            console.log('Analytics data is not available');
            return {
                labels: [],
                datasets: [
                    {
                        label: 'Revenue ($)',
                        data: [],
                        backgroundColor: 'rgba(57, 255, 20, 0.6)',
                        borderColor: 'rgba(57, 255, 20, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Tickets Sold',
                        data: [],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };
        }

        // Get top 5 events by revenue
        const eventPerformance = analyticsData
            .filter(event => event && event.eventTitle)
            .map(event => ({
                name: event.eventTitle,
                revenue: event.totalRevenue || 0,
                ticketsSold: event.totalTicketsSold || 0,
                category: event.category || 'Uncategorized'
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            labels: eventPerformance.map(event => event.name),
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: eventPerformance.map(event => event.revenue),
                    backgroundColor: 'rgba(57, 255, 20, 0.6)',
                    borderColor: 'rgba(57, 255, 20, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Tickets Sold',
                    data: eventPerformance.map(event => event.ticketsSold),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#fff',
                    font: {
                        size: 14,
                        family: "'Poppins', sans-serif"
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                color: '#fff',
                font: {
                    size: 20,
                    family: "'Poppins', sans-serif",
                    weight: 'bold'
                },
                padding: {
                    top: 20,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 16,
                    family: "'Poppins', sans-serif"
                },
                bodyFont: {
                    size: 14,
                    family: "'Poppins', sans-serif"
                },
                padding: 12,
                cornerRadius: 8
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };

    const barOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                ...chartOptions.plugins.title,
                text: 'Top 5 Events Performance'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#fff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: '#fff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>Event Analytics</h2>
                <p>Insights and statistics about your events</p>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card chart-card">
                    <div className="chart-container">
                        {getCategoryDistributionData() && (
                            <Pie 
                                data={getCategoryDistributionData()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Event Categories Distribution'
                                        }
                                    }
                                }} 
                            />
                        )}
                    </div>
                </div>

                <div className="analytics-card chart-card">
                    <div className="chart-container">
                        {getRevenueData() && (
                            <Pie 
                                data={getRevenueData()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Revenue by Category'
                                        }
                                    }
                                }} 
                            />
                        )}
                    </div>
                </div>

                <div className="analytics-card chart-card full-width">
                    <div className="chart-container">
                        {getEventPerformanceData() && (
                            <Bar 
                                data={getEventPerformanceData()} 
                                options={barOptions}
                            />
                        )}
                    </div>
                </div>

                <div className="analytics-card stats-card">
                    <h3>Key Metrics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{analyticsData?.length || 0}</span>
                            <span className="stat-label">Total Events</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {analyticsData?.reduce((acc, event) => acc + (event.totalTicketsSold || 0), 0) || 0}
                            </span>
                            <span className="stat-label">Tickets Sold</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                ${analyticsData?.reduce((acc, event) => acc + (event.totalRevenue || 0), 0) || 0}
                            </span>
                            <span className="stat-label">Total Revenue</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {analyticsData?.length ? 
                                    Math.round(analyticsData.reduce((acc, event) => acc + (event.percentageBooked || 0), 0) / analyticsData.length) : 
                                    0}%
                            </span>
                            <span className="stat-label">Avg. Attendance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics; 