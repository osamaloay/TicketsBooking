import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Home from './components/Home';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ProfilePage from './components/profile/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './App.css';
import EventDetails from './components/events/EventDetails';
import EventCompleteDet from './components/events/EventCompleteDet';
import TicketPurchase from './components/events/TicketPurchase';
import Dashboard from './components/dashboard/Dashboard';
import OrganizerDashboard from './components/dashboard/OrganizerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import CreateEvent from './components/events/CreateEvent';
import EditEvent from './components/events/EditEvent';
import UserBookingsPage from './components/bookings/UserBookingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/events/:id/details" element={<EventCompleteDet />} />

              {/* Protected Routes */}
              <Route path="/events/:id/purchase" element={
                <ProtectedRoute>
                  <TicketPurchase />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/organizer-dashboard" element={
                <ProtectedRoute requiredRole="organizer">
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <UserBookingsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
