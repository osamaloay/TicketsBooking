import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

// Import role-specific dashboard components
import StandardUserDashboard from './StandardUserDashboard';
import OrganizerDashboard from './OrganizerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show welcome toast when component mounts
    toast.success(`Welcome, ${user?.name}!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setLoading(false);
  }, [user?.name]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Render different dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'System Admin':
        return <AdminDashboard />;
      case 'Organizer':
        return <OrganizerDashboard />;
      case 'Standard User':
      default:
        return <StandardUserDashboard />;
    }
  };
  
//Standard User', 'Organizer', 'System Admin
  return (
    <div className="dashboard">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard; 