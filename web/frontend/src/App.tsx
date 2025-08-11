import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AppDispatch, RootState } from './redux/store';
import { getMe } from './redux/slices/authSlice';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Facilities from './pages/facilities/Facilities';
import FacilityDetail from './pages/facilities/FacilityDetail';
import CreateFacility from './pages/facilities/CreateFacility';
import EditFacility from './pages/facilities/EditFacility';
import Courts from './pages/courts/Courts';
import CreateCourt from './pages/courts/CreateCourt';
import EditCourt from './pages/courts/EditCourt';
import Bookings from './pages/bookings/Bookings';
import CreateBooking from './pages/bookings/CreateBooking';

import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

import Chatbot from './components/Chatbot';
import ChatButton from './components/ChatButton';
// import VoiceNavigation from './components/VoiceNavigation';
// import VoiceNavigationButton from './components/VoiceNavigationButton';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, token } = useSelector((state: RootState) => state.auth);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isVoiceNavigationOpen, setIsVoiceNavigationOpen] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, token, isAuthenticated]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner-dashboard" element={
            <ProtectedRoute requiredRole="Owner">
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Facility Routes */}
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/facilities/create" element={
            <ProtectedRoute requiredRole="Owner">
              <CreateFacility />
            </ProtectedRoute>
          } />
          <Route path="/facilities/:id" element={<FacilityDetail />} />
          <Route path="/facilities/:id/edit" element={
            <ProtectedRoute requiredRole="Owner">
              <EditFacility />
            </ProtectedRoute>
          } />
          
          {/* Court Routes */}
          <Route path="/facilities/:facilityId/courts" element={<Courts />} />
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
            <ProtectedRoute requiredRole="User">
              <CreateBooking />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
        </Routes>

        <ChatButton onClick={() => setIsChatbotOpen(true)} />
        <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
