import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import UserManagement from './pages/admin/UserManagement';

// Facility Pages
import Facilities from './pages/facilities/Facilities';
import FacilityDetail from './pages/facilities/FacilityDetail';
import CreateFacility from './pages/facilities/CreateFacility';
import EditFacility from './pages/facilities/EditFacility';

// Booking Pages
import Bookings from './pages/bookings/Bookings';
import CreateBooking from './pages/bookings/CreateBooking';
import VoiceNavigation from './components/VoiceNavigation';
import VoiceNavigationButton from './components/VoiceNavigationButton';
import Chatbot from './components/Chatbot';
import ChatButton from './components/ChatButton';
import NearbySportsPage from './pages/NearbySportsPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';

// Inner App Component that uses useNavigate
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isVoiceNavigationOpen, setIsVoiceNavigationOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        setIsVoiceNavigationOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/nearby-sports" element={<NearbySportsPage />} />

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

        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="Admin">
            <UserManagement />
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
      
      <VoiceNavigationButton onClick={() => setIsVoiceNavigationOpen(true)} />
      <VoiceNavigation 
        isOpen={isVoiceNavigationOpen} 
        onClose={() => setIsVoiceNavigationOpen(false)}
        onNavigate={(path) => {
          if (path === 'chatbot') {
            setIsChatbotOpen(true);
            setIsVoiceNavigationOpen(false);
          } else {
            navigate(path);
            setIsVoiceNavigationOpen(false);
          }
        }}
      />
      <ChatButton onClick={() => setIsChatbotOpen(true)} />
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch, getMe]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-qc-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
