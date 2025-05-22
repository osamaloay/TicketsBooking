import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) { 
    return <div>Loading...</div>;//show loading while checking authen
  }

  if (!user) {
    return <Navigate to="/login" replace />; //redirects to login (not authenticated)
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole) { 
    const userRole = user.role?.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();

    if (userRole !== requiredRoleLower) { 
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        case 'organizer':
          return <Navigate to="/organizer-dashboard" replace />;
        default:
          return <Navigate to="/dashboard" replace />; 
      }
    }
  }

  return children;
};

export default ProtectedRoute; 