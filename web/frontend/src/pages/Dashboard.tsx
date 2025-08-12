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
  Shield,
  MapPin,
  Play,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { fetchBookings, fetchOwnerBookings, fetchOwnerAnalytics } from '@/redux/slices/bookingSlice';
import { fetchAllUsers, fetchPendingFacilities } from '@/redux/slices/adminSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { bookings, ownerBookings, loading: bookingsLoading } = useSelector((state: RootState) => state.bookings);
  const { users, pendingFacilities: pendingFacilitiesList, loading: adminLoading } = useSelector((state: RootState) => state.admin);
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFacilities({}));
      if (user?.role === 'Owner') {
        dispatch(fetchOwnerBookings({}));
        dispatch(fetchOwnerAnalytics({ period: 'week' }));
      } else if (user?.role === 'Admin') {
        dispatch(fetchAllUsers({}));
        dispatch(fetchPendingFacilities({}));
        dispatch(fetchBookings(undefined));
      } else {
        dispatch(fetchBookings(undefined));
      }
    }
  }, [dispatch, isAuthenticated, user]);

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
        if (user?.role === 'Owner') {
          navigate('/owner-bookings');
        } else {
          navigate('/bookings');
        }
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
      case 'nearby-sports':
        navigate('/nearby-sports');
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
        if (user?.role === 'Owner') {
          navigate('/owner-bookings');
        } else {
          navigate('/bookings');
        }
        break;
      case 'bookCourt':
        navigate('/facilities');
        break;
      case 'browseFacilities':
        navigate('/facilities');
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'nearby-sports', label: 'Nearby Sports', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.role === 'Owner' ? [{ id: 'owner-dashboard', label: 'Owner Dashboard', icon: Building2 }] : []),
    ...(user?.role === 'Admin' ? [{ id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield }] : []),
  ];

  // Use appropriate booking data based on user role
  const userBookings = user?.role === 'Owner' ? ownerBookings.bookings : bookings;
  const upcomingBookings = [...userBookings].slice(0, 5);

  // Helper functions for user stats (defined before they're used)
  const getFavoriteSports = () => {
    const sportCounts: { [key: string]: number } = {};
    userBookings.forEach(booking => {
      const sportType = typeof booking.court === 'string' ? 'Unknown' : booking.court?.sportType || 'Unknown';
      sportCounts[sportType] = (sportCounts[sportType] || 0) + 1;
    });
    const sortedSports = Object.entries(sportCounts).sort(([,a], [,b]) => b - a);
    return sortedSports.length > 0 ? sortedSports[0][0] : 'None';
  };

  const getBookingStreak = () => {
    // Calculate consecutive days with bookings
    const sortedBookings = [...userBookings]
      .filter(b => b.status === 'Completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedBookings.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedBookings[0].date);
    
    for (let i = 1; i < sortedBookings.length; i++) {
      const bookingDate = new Date(sortedBookings[i].date);
      const diffDays = Math.floor((currentDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = bookingDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Dynamic stats based on user role
  const getRoleBasedStats = () => {
    switch (user?.role) {
      case 'Admin':
        return {
          totalUsers: users?.users?.length || 0,
          totalFacilities: facilities.length,
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
          pendingFacilities: pendingFacilitiesList?.length || 0,
          verifiedUsers: users?.users?.filter((u: any) => u.isEmailVerified)?.length || 0,
          activeBookings: bookings.filter(b => b.status === 'Confirmed').length,
          platformGrowth: Math.round(((bookings.length - (bookings.length * 0.8)) / (bookings.length * 0.8)) * 100)
        };
      
      case 'Owner':
        return {
          totalBookings: userBookings.length,
          totalRevenue: userBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
          occupancyRate: facilities.length > 0 ? Math.round((userBookings.length / (facilities.length * 8)) * 100) : 0,
          activeGames: userBookings.filter(b => b.status === 'Confirmed').length,
          pendingBookings: userBookings.filter(b => b.status === 'Pending').length,
          totalFacilities: facilities.length,
          averageRating: facilities.length > 0 ? 
            Math.round(facilities.reduce((sum: number, facility: any) => sum + (facility.averageRating || 0), 0) / facilities.length * 10) / 10 : 0,
          monthlyGrowth: Math.round(((userBookings.length - (userBookings.length * 0.85)) / (userBookings.length * 0.85)) * 100)
        };
      
      default: // User role
        return {
          totalBookings: userBookings.length,
          totalSpent: userBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
          upcomingBookings: userBookings.filter(b => new Date(b.date) > new Date()).length,
          completedBookings: userBookings.filter(b => b.status === 'Completed').length,
          favoriteSports: getFavoriteSports(),
          averageBookingValue: userBookings.length > 0 ? 
            Math.round(userBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) / userBookings.length) : 0,
          bookingStreak: getBookingStreak()
        };
    }
  };

  const stats = getRoleBasedStats();

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

          {/* External Sports Website Button */}
          <div className="mt-6 px-6">
            <motion.button
              onClick={() => window.open('https://sports-befe.vercel.app', '_blank')}
              className="w-full flex items-center px-4 py-3 text-left bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5 mr-3" />
              <div className="flex-1">
                <p className="font-medium">Sports Hub</p>
                <p className="text-xs opacity-90">Explore More Sports</p>
              </div>
            </motion.button>
          </div>

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

              {/* Dynamic Stats Cards based on User Role */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {user?.role === 'Admin' ? (
                  // Admin Stats
                  <>
                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-primary/10 rounded-qc-radius flex items-center justify-center">
                          <Users className="w-6 h-6 text-qc-primary" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{stats.platformGrowth}%</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">{stats.totalUsers}</h3>
                      <p className="text-gray-600 text-sm">Total Users</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-accent/10 rounded-qc-radius flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-qc-accent" />
                        </div>
                        <span className="text-sm text-orange-600 font-medium">{stats.pendingFacilities}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">{stats.totalFacilities}</h3>
                      <p className="text-gray-600 text-sm">Total Facilities</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-lilac/10 rounded-qc-radius flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-qc-lilac" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{stats.platformGrowth}%</span>
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
                        <div className="w-12 h-12 bg-green-100 rounded-qc-radius flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{stats.platformGrowth}%</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                      <p className="text-gray-600 text-sm">Platform Revenue</p>
                    </motion.div>
                  </>
                ) : user?.role === 'Owner' ? (
                  // Owner Stats
                  <>
                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-primary/10 rounded-qc-radius flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-qc-primary" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
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
                        <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-lilac/10 rounded-qc-radius flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-qc-lilac" />
                        </div>
                        <span className="text-sm text-blue-600 font-medium">{stats.pendingBookings}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">{stats.totalFacilities}</h3>
                      <p className="text-gray-600 text-sm">My Facilities</p>
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
                  </>
                ) : (
                  // User Stats
                  <>
                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-primary/10 rounded-qc-radius flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-qc-primary" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">{stats.upcomingBookings}</span>
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
                        <span className="text-sm text-blue-600 font-medium">₹{stats.averageBookingValue}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">₹{(stats.totalSpent || 0).toLocaleString()}</h3>
                      <p className="text-gray-600 text-sm">Total Spent</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-qc-lilac/10 rounded-qc-radius flex items-center justify-center">
                          <Play className="w-6 h-6 text-qc-lilac" />
                        </div>
                        <span className="text-sm text-purple-600 font-medium">{stats.bookingStreak}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">{stats.favoriteSports}</h3>
                      <p className="text-gray-600 text-sm">Favorite Sport</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white p-6 rounded-2xl shadow-sm border"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-qc-radius flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">{stats.bookingStreak}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-qc-text">{stats.completedBookings}</h3>
                      <p className="text-gray-600 text-sm">Completed</p>
                    </motion.div>
                  </>
                )}
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
                    ) : userBookings.length > 0 ? (
                      <div className="space-y-3">
                        {userBookings.slice(0, 3).map((booking) => (
                          <div key={booking._id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-qc-text">
                                  {typeof booking.court === 'string' ? booking.court : booking.court?.name || 'Unknown Court'}
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
                              {typeof booking.user === 'string' ? booking.user : booking.user?.name || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {typeof booking.court === 'string' ? booking.court : booking.court?.name || 'Unknown Court'}
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
