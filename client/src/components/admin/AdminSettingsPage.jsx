import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState({
        maxEventsPerOrganizer: 10,
        maxTicketsPerEvent: 1000,
        ticketPriceLimit: 1000,
        eventApprovalRequired: true
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await userService.getAdminSettings();
            setSettings(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await userService.updateAdminSettings(settings);
            setSuccess('Settings updated successfully');
        } catch (err) {
            setError(err.message || 'Failed to update settings');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="admin-settings-container">
            <div className="admin-settings-header">
                <h2>System Settings</h2>
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="maxEventsPerOrganizer">
                        Maximum Events per Organizer
                    </label>
                    <input
                        type="number"
                        id="maxEventsPerOrganizer"
                        name="maxEventsPerOrganizer"
                        value={settings.maxEventsPerOrganizer}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="maxTicketsPerEvent">
                        Maximum Tickets per Event
                    </label>
                    <input
                        type="number"
                        id="maxTicketsPerEvent"
                        name="maxTicketsPerEvent"
                        value={settings.maxTicketsPerEvent}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ticketPriceLimit">
                        Maximum Ticket Price (in currency)
                    </label>
                    <input
                        type="number"
                        id="ticketPriceLimit"
                        name="ticketPriceLimit"
                        value={settings.ticketPriceLimit}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="eventApprovalRequired"
                            checked={settings.eventApprovalRequired}
                            onChange={handleChange}
                        />
                        Require Event Approval
                    </label>
                </div>

                <button type="submit" className="save-settings-btn">
                    Save Settings
                </button>
            </form>
        </div>
    );
};

export default AdminSettingsPage; 