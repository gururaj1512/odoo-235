import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './redux/store';
import { getMe } from './redux/slices/authSlice';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerBookings from './pages/owner/OwnerBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Facility Pages
import Facilities from './pages/facilities/Facilities';
import FacilityDetail from './pages/facilities/FacilityDetail';
import CreateFacility from './pages/facilities/CreateFacility';
import EditFacility from './pages/facilities/EditFacility';

// Court Pages
import Courts from './pages/courts/Courts';
import CreateCourt from './pages/courts/CreateCourt';
import EditCourt from './pages/courts/EditCourt';

// Booking Pages
import Bookings from './pages/bookings/Bookings';
import CreateBooking from './pages/bookings/CreateBooking';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-qc-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Owner Routes */}
        <Route path="/owner-dashboard" element={
          <ProtectedRoute requiredRole="Owner">
            <OwnerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/owner-bookings" element={
          <ProtectedRoute requiredRole="Owner">
            <OwnerBookings />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Facility Routes */}
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:id" element={<FacilityDetail />} />
        <Route path="/facilities/create" element={
          <ProtectedRoute requiredRole="Owner">
            <CreateFacility />
          </ProtectedRoute>
        } />
        <Route path="/facilities/:id/edit" element={
          <ProtectedRoute requiredRole="Owner">
            <EditFacility />
          </ProtectedRoute>
        } />

        {/* Court Routes */}
        <Route path="/courts" element={
          <ProtectedRoute requiredRole="Owner">
            <Courts />
          </ProtectedRoute>
        } />
        <Route path="/facilities/:facilityId/courts/create" element={
          <ProtectedRoute requiredRole="Owner">
            <CreateCourt />
          </ProtectedRoute>
        } />
        <Route path="/courts/:id/edit" element={
          <ProtectedRoute requiredRole="Owner">
            <EditCourt />
          </ProtectedRoute>
        } />

        {/* Booking Routes */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/bookings/create" element={
          <ProtectedRoute>
            <CreateBooking />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
