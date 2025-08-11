import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch } from '@/redux/store';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign,
  LogOut,
  User,
  Building2,
  BookOpen,
  Home,
  Shield
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { fetchBookings } from '@/redux/slices/bookingSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { bookings, loading: bookingsLoading } = useSelector((state: RootState) => state.bookings);
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFacilities());
      dispatch(fetchBookings());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to appropriate pages based on tab
    switch (tabId) {
      case 'facilities':
        navigate('/facilities');
        break;
      case 'bookings':
        navigate('/bookings');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'owner-dashboard':
        navigate('/owner-dashboard');
        break;
      case 'admin-dashboard':
        navigate('/admin-dashboard');
        break;
      case 'analytics':
        // Analytics page would be implemented later
        console.log('Analytics page - coming soon');
        break;
      case 'settings':
        // Settings page would be implemented later
        console.log('Settings page - coming soon');
        break;
      default:
        // Stay on dashboard overview
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addFacility':
        navigate('/facilities/create');
        break;
      case 'viewBookings':
        navigate('/bookings');
        break;
      case 'analytics':
        console.log('Analytics - coming soon');
        break;
      case 'bookCourt':
        navigate('/facilities');
        break;
      case 'browseFacilities':
        navigate('/facilities');
        break;
      case 'viewBookings':
        navigate('/bookings');
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.role === 'Owner' ? [{ id: 'owner-dashboard', label: 'Owner Dashboard', icon: Building2 }] : []),
    ...(user?.role === 'Admin' ? [{ id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield }] : []),
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const upcomingBookings = bookings.slice(0, 5);

  const stats = {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
    occupancyRate: facilities.length > 0 ? Math.round((bookings.length / (facilities.length * 8)) * 100) : 0,
    activeGames: bookings.filter(b => b.status === 'Confirmed').length
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white shadow-lg h-screen sticky top-0"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-qc-text">QuickCourt</h2>
            <p className="text-sm text-gray-600">
              {user?.role === 'Owner' ? 'Owner Dashboard' : 'User Dashboard'}
            </p>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-qc-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-qc-primary" />
              </div>
              <div>
                <p className="font-medium text-qc-text">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-qc-primary/10 text-qc-primary border-r-2 border-qc-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </motion.button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-colors rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-qc-text">Dashboard Overview</h1>
                  <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
                </div>
                {user?.role === 'Owner' && (
                  <motion.button 
                    className="px-4 py-2 bg-qc-primary text-white rounded-qc-radius hover:bg-qc-primary/90 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('addFacility')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Facility
                  </motion.button>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                  className="bg-white p-6 rounded-2xl shadow-sm border"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-qc-primary/10 rounded-qc-radius flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-qc-primary" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-qc-text">{stats.totalBookings}</h3>
                  <p className="text-gray-600 text-sm">Total Bookings</p>
                </motion.div>

                <motion.div 
                  className="bg-white p-6 rounded-2xl shadow-sm border"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-qc-accent/10 rounded-qc-radius flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-qc-accent" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">+8%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-qc-text">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                </motion.div>

                <motion.div 
                  className="bg-white p-6 rounded-2xl shadow-sm border"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-qc-lilac/10 rounded-qc-radius flex items-center justify-center">
                      <Users className="w-6 h-6 text-qc-lilac" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">+5%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-qc-text">{stats.occupancyRate}%</h3>
                  <p className="text-gray-600 text-sm">Occupancy Rate</p>
                </motion.div>

                <motion.div 
                  className="bg-white p-6 rounded-2xl shadow-sm border"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-qc-radius flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Live</span>
                  </div>
                  <h3 className="text-2xl font-bold text-qc-text">{stats.activeGames}</h3>
                  <p className="text-gray-600 text-sm">Active Games</p>
                </motion.div>
              </div>

              {/* Role-based Content */}
              {user?.role === 'Owner' ? (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Facilities Overview */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold text-qc-text mb-4">Your Facilities</h3>
                    {facilitiesLoading ? (
                      <LoadingSpinner />
                    ) : facilities.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {facilities.slice(0, 4).map((facility) => (
                          <div key={facility._id} className="p-4 border rounded-lg">
                            <h4 className="font-medium text-qc-text">{facility.name}</h4>
                            <p className="text-sm text-gray-600">{facility.location.city}</p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No facilities yet. Create your first facility!</p>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold text-qc-text mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('addFacility')}
                      >
                        <div className="flex items-center">
                          <Plus className="w-4 h-4 mr-3 text-qc-primary" />
                          <span className="text-sm font-medium">Add New Facility</span>
                        </div>
                      </button>
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('viewBookings')}
                      >
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-3 text-qc-accent" />
                          <span className="text-sm font-medium">View All Bookings</span>
                        </div>
                      </button>
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('analytics')}
                      >
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-3 text-qc-lilac" />
                          <span className="text-sm font-medium">Analytics Report</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* User Bookings */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold text-qc-text mb-4">Your Recent Bookings</h3>
                    {bookingsLoading ? (
                      <LoadingSpinner />
                    ) : bookings.length > 0 ? (
                      <div className="space-y-3">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking._id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-qc-text">
                                  {typeof booking.court === 'string' ? booking.court : booking.court.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No bookings yet. Book your first court!</p>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold text-qc-text mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('bookCourt')}
                      >
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-3 text-qc-primary" />
                          <span className="text-sm font-medium">Book a Court</span>
                        </div>
                      </button>
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('viewBookings')}
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-3 text-qc-accent" />
                          <span className="text-sm font-medium">View All Bookings</span>
                        </div>
                      </button>
                      <button 
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickAction('browseFacilities')}
                      >
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-3 text-qc-lilac" />
                          <span className="text-sm font-medium">Browse Facilities</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Bookings Table */}
              {user?.role === 'Owner' && (
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-qc-text">Recent Bookings</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {upcomingBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-qc-text">
                              {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {typeof booking.user === 'string' ? booking.user : booking.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {typeof booking.court === 'string' ? booking.court : booking.court.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {booking.startTime} - {booking.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ₹{booking.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <h2 className="text-xl font-bold text-qc-text mb-2">
                {tabs.find(t => t.id === activeTab)?.label} Section
              </h2>
              <p className="text-gray-600">This section is under development.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
