import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Building2, 
  BookOpen, 
  Settings, 
  TrendingUp, 
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  ExternalLink,
  FileText
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { fetchAllUsers, updateFacilityApproval, fetchPendingFacilities } from '@/redux/slices/adminSlice';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { fetchBookings } from '@/redux/slices/bookingSlice';
import { PDFService } from '@/services/pdfService';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.admin.users);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { bookings, loading: bookingsLoading } = useSelector((state: RootState) => state.bookings);
  const { facilities: pendingFacilitiesList, loading: pendingFacilitiesLoading } = useSelector((state: RootState) => state.admin.pendingFacilities);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      dispatch(fetchAllUsers());
      dispatch(fetchFacilities({}));
      dispatch(fetchBookings(undefined));
      // Fetch pending facilities specifically
      dispatch(fetchPendingFacilities());
    }
  }, [dispatch, user]);

  // Calculate real data from Redux state
  const totalUsers = users.length;
  const totalOwners = users.filter(user => user.role === 'Owner').length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const totalActiveCourts = facilities.reduce((acc, facility) => acc + (facility.courts?.length || 0), 0);
  const pendingFacilitiesCount = pendingFacilitiesList.length;
  const activeFacilities = facilities.filter(f => f.approvalStatus === 'approved').length;

  // Calculate real user registration trends with dynamic period
  const getUserRegistrationTrends = () => {
    const now = new Date();
    let labels: string[] = [];
    let data: { month: string; users: number; owners: number }[] = [];
    
    if (selectedPeriod === 'week') {
      // Last 7 days
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = labels.map(day => {
        const dayUsers = [...users].filter(user => {
          const userDate = new Date(user.createdAt);
          const dayName = userDate.toLocaleDateString('en-US', { weekday: 'short' });
          return dayName === day;
        });
        
        return {
          month: day,
          users: dayUsers.filter(user => user.role === 'User').length,
          owners: dayUsers.filter(user => user.role === 'Owner').length
        };
      });
    } else if (selectedPeriod === 'month') {
      // Last 6 months
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      data = labels.map(month => {
        const monthUsers = [...users].filter(user => {
          const userDate = new Date(user.createdAt);
          const monthName = userDate.toLocaleDateString('en-US', { month: 'short' });
          return monthName === month;
        });
        
        return {
          month,
          users: monthUsers.filter(user => user.role === 'User').length,
          owners: monthUsers.filter(user => user.role === 'Owner').length
        };
      });
    } else {
      // Last 12 months
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = labels.map(month => {
        const monthUsers = [...users].filter(user => {
          const userDate = new Date(user.createdAt);
          const monthName = userDate.toLocaleDateString('en-US', { month: 'short' });
          return monthName === month;
        });
        
        return {
          month,
          users: monthUsers.filter(user => user.role === 'User').length,
          owners: monthUsers.filter(user => user.role === 'Owner').length
        };
      });
    }
    
    return data;
  };

  const userRegistrationTrends = getUserRegistrationTrends();

  // Calculate real booking activity with dynamic period
  const getBookingActivity = () => {
    const now = new Date();
    let labels: string[] = [];
    let data: { day: string; bookings: number; revenue: number }[] = [];
    
    if (selectedPeriod === 'week') {
      // Last 7 days
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = labels.map(day => {
        const dayBookings = [...bookings].filter(booking => {
          const bookingDate = new Date(booking.date);
          const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'short' });
          return dayName === day;
        });
        
        return {
          day,
          bookings: dayBookings.length,
          revenue: dayBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
        };
      });
    } else if (selectedPeriod === 'month') {
      // Last 4 weeks
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      data = labels.map((week, index) => {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (3 - index) * 7);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        const weekBookings = [...bookings].filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        });
        
        return {
          day: week,
          bookings: weekBookings.length,
          revenue: weekBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
        };
      });
    } else {
      // Last 12 months
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = labels.map(month => {
        const monthBookings = [...bookings].filter(booking => {
          const bookingDate = new Date(booking.date);
          const monthName = bookingDate.toLocaleDateString('en-US', { month: 'short' });
          return monthName === month;
        });
        
        return {
          day: month,
          bookings: monthBookings.length,
          revenue: monthBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
        };
      });
    }
    
    return data;
  };

  const bookingActivity = getBookingActivity();

  // Calculate real most active sports
  const getMostActiveSports = () => {
    const sportBookings: { [key: string]: { bookings: number; revenue: number } } = {};
    
    [...bookings].forEach(booking => {
      const sportType = typeof booking.court === 'string' ? 'Unknown' : booking.court?.sportType || 'Unknown';
      if (!sportBookings[sportType]) {
        sportBookings[sportType] = { bookings: 0, revenue: 0 };
      }
      sportBookings[sportType].bookings++;
      sportBookings[sportType].revenue += booking.totalAmount || 0;
    });

    return Object.entries(sportBookings)
      .map(([sport, data]) => ({
        sport,
        bookings: data.bookings,
        revenue: data.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  const mostActiveSports = getMostActiveSports();

  // Calculate facility performance metrics
  const getFacilityPerformance = () => {
    const facilityStats: { [key: string]: { bookings: number; revenue: number; rating: number } } = {};
    
    [...bookings].forEach(booking => {
      const facilityName = typeof booking.facility === 'string' ? 'Unknown' : booking.facility?.name || 'Unknown';
      if (!facilityStats[facilityName]) {
        facilityStats[facilityName] = { bookings: 0, revenue: 0, rating: 0 };
      }
      facilityStats[facilityName].bookings++;
      facilityStats[facilityName].revenue += booking.totalAmount || 0;
      // Add rating if available
      if (typeof booking.facility !== 'string' && booking.facility?.averageRating) {
        facilityStats[facilityName].rating = booking.facility.averageRating;
      }
    });

    return Object.entries(facilityStats)
      .map(([facility, data]) => ({
        facility,
        bookings: data.bookings,
        revenue: data.revenue,
        rating: data.rating
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const facilityPerformance = getFacilityPerformance();

  // Calculate platform growth metrics
  const getPlatformGrowth = () => {
    const totalUsers = users.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const activeFacilities = facilities.filter(f => f.approvalStatus === 'approved').length;
    
    // Calculate growth percentages (mock data for demonstration)
    const userGrowth = Math.round(((totalUsers - (totalUsers * 0.8)) / (totalUsers * 0.8)) * 100);
    const bookingGrowth = Math.round(((totalBookings - (totalBookings * 0.85)) / (totalBookings * 0.85)) * 100);
    const revenueGrowth = Math.round(((totalRevenue - (totalRevenue * 0.9)) / (totalRevenue * 0.9)) * 100);
    const facilityGrowth = Math.round(((activeFacilities - (activeFacilities * 0.75)) / (activeFacilities * 0.75)) * 100);
    
    return {
      userGrowth,
      bookingGrowth,
      revenueGrowth,
      facilityGrowth
    };
  };

  const platformGrowth = getPlatformGrowth();

  // Get real pending facilities
  const pendingFacilities = [...pendingFacilitiesList]
    .slice(0, 3)
    .map(facility => ({
      id: facility._id,
      name: facility.name,
      owner: typeof facility.owner === 'string' ? 'Unknown' : facility.owner?.name || 'Unknown',
      location: `${facility.location.city}, ${facility.location.state}`,
      sports: facility.courts?.map((court: any) => court.sportType) || [],
      submittedDate: facility.createdAt,
      status: facility.approvalStatus
    }));

  // Get real recent users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: user.createdAt,
      status: 'active' // Default to active since we don't have isActive in User type
    }));

  const handleTabClick = (tabId: string) => {
    if (tabId === 'users') {
      // Navigate to the dedicated User Management page
      window.location.href = '/admin/users';
      return;
    }
    if (tabId === 'nearby-sports') {
      window.location.href = '/nearby-sports';
      return;
    }
    setActiveTab(tabId);
  };

  const handleFacilityAction = async (facilityId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        setIsApproving(facilityId);
        await dispatch(updateFacilityApproval({ 
          facilityId, 
          data: { status: 'approved' } 
        })).unwrap();
        showNotification('success', 'Facility approved successfully!');
      } else {
        setIsRejecting(facilityId);
        // For rejection, we might want to add a reason
        await dispatch(updateFacilityApproval({ 
          facilityId, 
          data: { status: 'rejected', rejectionReason: 'Rejected by admin' } 
        })).unwrap();
        showNotification('success', 'Facility rejected successfully!');
      }
      
      // Refresh the facilities data after approval/rejection
      dispatch(fetchFacilities({}));
      dispatch(fetchPendingFacilities()); // Refresh pending facilities
    } catch (error) {
      console.error(`Failed to ${action} facility:`, error);
      showNotification('error', `Failed to ${action} facility. Please try again.`);
    } finally {
      setIsApproving(null);
      setIsRejecting(null);
    }
  };

  const handleUserAction = (userId: string, action: 'ban' | 'unban') => {

  };

  const handleViewFacilityDetails = (facilityId: string) => {
    // Navigate to facility details page
    window.open(`/facilities/${facilityId}`, '_blank');
  };

  const handleGeneratePDF = async () => {
    try {
      const adminStats = {
        totalUsers,
        totalOwners,
        totalBookings,
        totalRevenue,
        totalActiveCourts,
        pendingFacilitiesCount,
        activeFacilities,
        userRegistrationTrends,
        bookingActivity,
        mostActiveSports,
        facilityPerformance,
        platformGrowth,
      };
      
      await PDFService.generateAdminReport(adminStats);
      showNotification('success', 'PDF report generated successfully!');
    } catch (error: any) {
      showNotification('error', 'Failed to generate PDF report');
      console.error('PDF generation error:', error);
    }
  };

  if (usersLoading || facilitiesLoading || bookingsLoading || pendingFacilitiesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your platform overview</p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleGeneratePDF}
                className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </motion.button>
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'facilities', label: 'Facility Approval', icon: Building2 },
                  { id: 'users', label: 'User Management', icon: Users },
                  { id: 'nearby-sports', label: 'Nearby Sports', icon: MapPin },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-qc-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* PDF Report Generation Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <motion.button
                  onClick={handleGeneratePDF}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Generate Report</p>
                    <p className="text-xs opacity-90">Download PDF Report</p>
                  </div>
                </motion.button>
              </div>

              {/* External Sports Website Button */}
              <div className="mt-4">
                <motion.button
                  onClick={() => window.open('https://sports-befe.vercel.app', '_blank')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Sports Hub</p>
                    <p className="text-xs opacity-90">Explore More Sports</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Global Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-qc-text">{totalUsers.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Facility Owners</p>
                            <p className="text-2xl font-bold text-qc-text">{totalOwners}</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-qc-text">{totalBookings.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Courts</p>
                            <p className="text-2xl font-bold text-qc-text">{totalActiveCourts}</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Settings className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-qc-text">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-qc-text">{pendingFacilitiesCount}</p>
                          </div>
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Radar Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Registration Radar Chart */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-qc-text">User Registration Trends</h3>
                          <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                          </select>
                        </div>
                        <div className="relative h-64 flex items-center justify-center">
                          {/* Radar Chart Background */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Radar Grid Lines */}
                              {[20, 40, 60, 80, 100].map((radius, index) => (
                                <circle
                                  key={radius}
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="1"
                                  opacity={0.5}
                                />
                              ))}
                              
                              {/* Radar Axes */}
                              {userRegistrationTrends.map((_, index) => {
                                const angle = (index * 360) / userRegistrationTrends.length;
                                const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                                const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <line
                                    key={index}
                                    x1="100"
                                    y1="100"
                                    x2={x1}
                                    y2={y1}
                                    stroke="#d1d5db"
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Radar Chart Data */}
                          <div className="relative z-10">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* User Registration Data */}
                              <polygon
                                points={userRegistrationTrends.map((month, index) => {
                                  const maxUsers = Math.max(...userRegistrationTrends.map(m => m.users + m.owners));
                                  const value = month.users + month.owners;
                                  const radius = maxUsers > 0 ? (value / maxUsers) * 80 : 0;
                                  const angle = (index * 360) / userRegistrationTrends.length;
                                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                  return `${x},${y}`;
                                }).join(' ')}
                                fill="rgba(59, 130, 246, 0.2)"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                              
                              {/* Data Points */}
                              {userRegistrationTrends.map((month, index) => {
                                const maxUsers = Math.max(...userRegistrationTrends.map(m => m.users + m.owners));
                                const value = month.users + month.owners;
                                const radius = maxUsers > 0 ? (value / maxUsers) * 80 : 0;
                                const angle = (index * 360) / userRegistrationTrends.length;
                                const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#3b82f6"
                                    className="transition-all duration-500"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Labels */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {userRegistrationTrends.map((month, index) => {
                              const angle = (index * 360) / userRegistrationTrends.length;
                              const labelRadius = 110;
                              const x = 100 + labelRadius * Math.cos((angle * Math.PI) / 180);
                              const y = 100 + labelRadius * Math.sin((angle * Math.PI) / 180);
                              return (
                                <div
                                  key={index}
                                  className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
                                  style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                  }}
                                >
                                  {month.month}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600">Total Users: {userRegistrationTrends.reduce((sum, m) => sum + m.users + m.owners, 0)}</p>
                        </div>
                      </div>

                      {/* Booking Activity Radar Chart */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-qc-text">Booking Activity & Revenue</h3>
                          <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                          </select>
                        </div>
                        <div className="relative h-64 flex items-center justify-center">
                          {/* Radar Chart Background */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Radar Grid Lines */}
                              {[20, 40, 60, 80, 100].map((radius, index) => (
                                <circle
                                  key={radius}
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="1"
                                  opacity={0.5}
                                />
                              ))}
                              
                              {/* Radar Axes */}
                              {bookingActivity.map((_, index) => {
                                const angle = (index * 360) / bookingActivity.length;
                                const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                                const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <line
                                    key={index}
                                    x1="100"
                                    y1="100"
                                    x2={x1}
                                    y2={y1}
                                    stroke="#d1d5db"
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Radar Chart Data */}
                          <div className="relative z-10">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Booking Activity Data */}
                              <polygon
                                points={bookingActivity.map((day, index) => {
                                  const maxBookings = Math.max(...bookingActivity.map(d => d.bookings));
                                  const radius = maxBookings > 0 ? (day.bookings / maxBookings) * 80 : 0;
                                  const angle = (index * 360) / bookingActivity.length;
                                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                  return `${x},${y}`;
                                }).join(' ')}
                                fill="rgba(34, 197, 94, 0.2)"
                                stroke="#22c55e"
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                              
                              {/* Data Points */}
                              {bookingActivity.map((day, index) => {
                                const maxBookings = Math.max(...bookingActivity.map(d => d.bookings));
                                const radius = maxBookings > 0 ? (day.bookings / maxBookings) * 80 : 0;
                                const angle = (index * 360) / bookingActivity.length;
                                const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#22c55e"
                                    className="transition-all duration-500"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Labels */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {bookingActivity.map((day, index) => {
                              const angle = (index * 360) / bookingActivity.length;
                              const labelRadius = 110;
                              const x = 100 + labelRadius * Math.cos((angle * Math.PI) / 180);
                              const y = 100 + labelRadius * Math.sin((angle * Math.PI) / 180);
                              return (
                                <div
                                  key={index}
                                  className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
                                  style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                  }}
                                >
                                  {day.day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600">
                            Total Bookings: {bookingActivity.reduce((sum, d) => sum + d.bookings, 0)} | 
                            Revenue: ₹{bookingActivity.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Radar Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sports Performance Radar Chart */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold text-qc-text mb-6">Sports Performance</h3>
                        <div className="relative h-64 flex items-center justify-center">
                          {/* Radar Chart Background */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Radar Grid Lines */}
                              {[20, 40, 60, 80, 100].map((radius, index) => (
                                <circle
                                  key={radius}
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="1"
                                  opacity={0.5}
                                />
                              ))}
                              
                              {/* Radar Axes */}
                              {mostActiveSports.map((_, index) => {
                                const angle = (index * 360) / mostActiveSports.length;
                                const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                                const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <line
                                    key={index}
                                    x1="100"
                                    y1="100"
                                    x2={x1}
                                    y2={y1}
                                    stroke="#d1d5db"
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Radar Chart Data */}
                          <div className="relative z-10">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Sports Performance Data */}
                              <polygon
                                points={mostActiveSports.map((sport, index) => {
                                  const maxBookings = Math.max(...mostActiveSports.map(s => s.bookings));
                                  const radius = maxBookings > 0 ? (sport.bookings / maxBookings) * 80 : 0;
                                  const angle = (index * 360) / mostActiveSports.length;
                                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                  return `${x},${y}`;
                                }).join(' ')}
                                fill="rgba(245, 158, 11, 0.2)"
                                stroke="#f59e0b"
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                              
                              {/* Data Points */}
                              {mostActiveSports.map((sport, index) => {
                                const maxBookings = Math.max(...mostActiveSports.map(s => s.bookings));
                                const radius = maxBookings > 0 ? (sport.bookings / maxBookings) * 80 : 0;
                                const angle = (index * 360) / mostActiveSports.length;
                                const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#f59e0b"
                                    className="transition-all duration-500"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Labels */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {mostActiveSports.map((sport, index) => {
                              const angle = (index * 360) / mostActiveSports.length;
                              const labelRadius = 110;
                              const x = 100 + labelRadius * Math.cos((angle * Math.PI) / 180);
                              const y = 100 + labelRadius * Math.sin((angle * Math.PI) / 180);
                              return (
                                <div
                                  key={index}
                                  className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2 text-center"
                                  style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                  }}
                                >
                                  {sport.sport}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600">
                            Total Bookings: {mostActiveSports.reduce((sum, s) => sum + s.bookings, 0)} | 
                            Revenue: ₹{mostActiveSports.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Facility Performance Radar Chart */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold text-qc-text mb-6">Facility Performance</h3>
                        <div className="relative h-64 flex items-center justify-center">
                          {/* Radar Chart Background */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Radar Grid Lines */}
                              {[20, 40, 60, 80, 100].map((radius, index) => (
                                <circle
                                  key={radius}
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="1"
                                  opacity={0.5}
                                />
                              ))}
                              
                              {/* Radar Axes */}
                              {facilityPerformance.map((_, index) => {
                                const angle = (index * 360) / facilityPerformance.length;
                                const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                                const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <line
                                    key={index}
                                    x1="100"
                                    y1="100"
                                    x2={x1}
                                    y2={y1}
                                    stroke="#d1d5db"
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Radar Chart Data */}
                          <div className="relative z-10">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {/* Facility Performance Data */}
                              <polygon
                                points={facilityPerformance.map((facility, index) => {
                                  const maxRevenue = Math.max(...facilityPerformance.map(f => f.revenue));
                                  const radius = maxRevenue > 0 ? (facility.revenue / maxRevenue) * 80 : 0;
                                  const angle = (index * 360) / facilityPerformance.length;
                                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                  return `${x},${y}`;
                                }).join(' ')}
                                fill="rgba(168, 85, 247, 0.2)"
                                stroke="#a855f7"
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                              
                              {/* Data Points */}
                              {facilityPerformance.map((facility, index) => {
                                const maxRevenue = Math.max(...facilityPerformance.map(f => f.revenue));
                                const radius = maxRevenue > 0 ? (facility.revenue / maxRevenue) * 80 : 0;
                                const angle = (index * 360) / facilityPerformance.length;
                                const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                                const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#a855f7"
                                    className="transition-all duration-500"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          
                          {/* Labels */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {facilityPerformance.map((facility, index) => {
                              const angle = (index * 360) / facilityPerformance.length;
                              const labelRadius = 110;
                              const x = 100 + labelRadius * Math.cos((angle * Math.PI) / 180);
                              const y = 100 + labelRadius * Math.sin((angle * Math.PI) / 180);
                              return (
                                <div
                                  key={index}
                                  className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-16"
                                  style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                  }}
                                >
                                  {facility.facility.length > 12 ? facility.facility.substring(0, 12) + '...' : facility.facility}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600">
                            Total Revenue: ₹{facilityPerformance.reduce((sum, f) => sum + f.revenue, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform Growth Metrics */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <h3 className="text-lg font-bold text-qc-text mb-6">Platform Growth Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-qc-text">{totalUsers}</p>
                          <p className="text-sm text-gray-600">Total Users</p>
                          <p className={`text-xs font-medium ${platformGrowth.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {platformGrowth.userGrowth >= 0 ? '+' : ''}{platformGrowth.userGrowth}%
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-qc-text">{totalBookings}</p>
                          <p className="text-sm text-gray-600">Total Bookings</p>
                          <p className={`text-xs font-medium ${platformGrowth.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {platformGrowth.bookingGrowth >= 0 ? '+' : ''}{platformGrowth.bookingGrowth}%
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="w-8 h-8 text-yellow-600" />
                          </div>
                          <p className="text-2xl font-bold text-qc-text">₹{totalRevenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className={`text-xs font-medium ${platformGrowth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {platformGrowth.revenueGrowth >= 0 ? '+' : ''}{platformGrowth.revenueGrowth}%
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building2 className="w-8 h-8 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-qc-text">{activeFacilities}</p>
                          <p className="text-sm text-gray-600">Active Facilities</p>
                          <p className={`text-xs font-medium ${platformGrowth.facilityGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {platformGrowth.facilityGrowth >= 0 ? '+' : ''}{platformGrowth.facilityGrowth}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'facilities' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-qc-text">Facility Approval</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {pendingFacilitiesCount} Pending
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {pendingFacilities.length === 0 ? (
                        <div className="text-center py-8">
                          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">No Pending Facilities</h3>
                          <p className="text-gray-500">All facility requests have been processed.</p>
                        </div>
                      ) : (
                        pendingFacilities.map((facility) => (
                          <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-qc-text">{facility.name}</h4>
                                <p className="text-sm text-gray-600">Owner: {facility.owner}</p>
                                <p className="text-sm text-gray-600">{facility.location}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleFacilityAction(facility.id, 'approve')}
                                  disabled={isApproving === facility.id || isRejecting === facility.id}
                                  className={`p-2 text-green-600 hover:text-green-700 transition-colors ${
                                    isApproving === facility.id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  title="Approve Facility"
                                >
                                  {isApproving === facility.id ? (
                                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <CheckCircle className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleFacilityAction(facility.id, 'reject')}
                                  disabled={isApproving === facility.id || isRejecting === facility.id}
                                  className={`p-2 text-red-600 hover:text-red-700 transition-colors ${
                                    isRejecting === facility.id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  title="Reject Facility"
                                >
                                  {isRejecting === facility.id ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <XCircle className="w-5 h-5" />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleViewFacilityDetails(facility.id)}
                                  className="p-2 text-gray-600 hover:text-qc-primary transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex gap-2">
                                {facility.sports.map((sport) => (
                                  <span key={sport} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {sport}
                                  </span>
                                ))}
                              </div>
                              <span className="text-gray-600">
                                Submitted: {new Date(facility.submittedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">User Management</h3>
                    
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-qc-text">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-600">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'Owner' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            <div className="flex gap-2">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'ban')}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'unban')}
                                  className="p-2 text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
