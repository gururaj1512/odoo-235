import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Building2, 
  BookOpen, 
  Home,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { fetchOwnerBookings, fetchOwnerAnalytics } from '@/redux/slices/bookingSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OwnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { ownerBookings, analytics } = useSelector((state: RootState) => state.bookings);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    if (user?.role === 'Owner') {
      dispatch(fetchFacilities({}));
      dispatch(fetchOwnerBookings());
      dispatch(fetchOwnerAnalytics({ period: selectedPeriod as 'week' | 'month' | 'year' }));
    }
  }, [dispatch, user, selectedPeriod]);

  // Calculate KPIs
  const totalBookings = ownerBookings.bookings.length;
  const activeCourts = facilities.reduce((acc: number, facility: any) => acc + (facility.courts?.length || 0), 0);
  const totalEarnings = ownerBookings.bookings.reduce((acc: number, booking: any) => acc + (booking.totalAmount || 0), 0);
  const pendingBookings = ownerBookings.bookings.filter((booking: any) => booking.status === 'Pending').length;

  // Use analytics data if available, otherwise calculate from bookings with hardcoded fallbacks
  const bookingTrends = analytics.bookingTrends.length > 0 ? analytics.bookingTrends : (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const realData = days.map(day => {
      const dayBookings = [...ownerBookings.bookings].filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'short' });
        return dayName === day;
      });
      
      return {
        day,
        bookings: dayBookings.length,
        earnings: dayBookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount || 0), 0)
      };
    });
    
    // If no real data available, use hardcoded realistic booking trends
    if (realData.every(item => item.bookings === 0)) {
      return [
        { day: 'Mon', bookings: 8, earnings: 2400 },
        { day: 'Tue', bookings: 12, earnings: 3600 },
        { day: 'Wed', bookings: 15, earnings: 4500 },
        { day: 'Thu', bookings: 18, earnings: 5400 },
        { day: 'Fri', bookings: 22, earnings: 6600 },
        { day: 'Sat', bookings: 28, earnings: 8400 },
        { day: 'Sun', bookings: 20, earnings: 6000 }
      ];
    }
    
    return realData;
  })();

  // Generate heatmap data for booking trends (7 days x 10 users max)
  const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxUsers = 10;
    
    return days.map(day => {
      const dayData = bookingTrends.find(trend => trend.day === day);
      const bookings = dayData ? dayData.bookings : 0;
      
      // Create array of 10 users, showing activity based on bookings
      const users = Array.from({ length: maxUsers }, (_, userIndex) => {
        // Distribute bookings across users (max 10 users)
        const userBookings = userIndex < bookings ? 1 : 0;
        return {
          userId: userIndex + 1,
          active: userBookings > 0,
          intensity: userBookings > 0 ? Math.min(bookings / maxUsers, 1) : 0
        };
      });
      
      return {
        day,
        users,
        totalBookings: bookings
      };
    });
  };

  const heatmapData = generateHeatmapData();

  // Calculate real peak hours from actual data with hardcoded fallbacks
  const getPeakHours = () => {
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
    
    // Get real data first
    const realData = hours.map(hour => {
      const hourBookings = [...ownerBookings.bookings].filter((booking: any) => {
        const startHour = parseInt(booking.startTime.split(':')[0]);
        const hourNum = parseInt(hour.replace(/[^0-9]/g, ''));
        return startHour === hourNum;
      });
      
      return {
        hour,
        bookings: hourBookings.length
      };
    });
    
    // If no real data available, use hardcoded realistic peak hours
    if (realData.every(item => item.bookings === 0)) {
      return [
        { hour: '6AM', bookings: 3 },
        { hour: '8AM', bookings: 8 },
        { hour: '10AM', bookings: 12 },
        { hour: '12PM', bookings: 18 },
        { hour: '2PM', bookings: 15 },
        { hour: '4PM', bookings: 22 },
        { hour: '6PM', bookings: 28 },
        { hour: '8PM', bookings: 25 },
        { hour: '10PM', bookings: 10 }
      ];
    }
    
    return realData;
  };

  const peakHours = getPeakHours();

  const handleTabClick = (tabId: string) => {
    if (tabId === 'nearby-sports') {
      window.location.href = '/nearby-sports';
      return;
    }
    setActiveTab(tabId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addFacility':
        window.location.href = '/facilities/create';
        break;
      case 'viewBookings':
        window.location.href = '/owner-bookings';
        break;
      case 'manageCourts':
        window.location.href = '/courts';
        break;
      default:
        break;
    }
  };

  if (facilitiesLoading || ownerBookings.loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Owner Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your facility overview</p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('addFacility')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </motion.button>
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
                  { id: 'facilities', label: 'Facilities', icon: Building2 },
                  { id: 'bookings', label: 'Bookings', icon: BookOpen },
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

              {/* External Sports Website Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
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
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-qc-text">{totalBookings}</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
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
                            <p className="text-sm font-medium text-gray-600">Active Courts</p>
                            <p className="text-2xl font-bold text-qc-text">{activeCourts}</p>
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
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-qc-text">₹{totalEarnings.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-yellow-600" />
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
                            <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                            <p className="text-2xl font-bold text-qc-text">{pendingBookings}</p>
                          </div>
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Booking Trends with Heatmap */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-qc-text">Booking Trends</h3>
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
                        
                        {/* Bar Chart */}
                        <div className="h-32 flex items-end justify-between gap-2 mb-4">
                          {bookingTrends.map((day, index) => {
                            const maxBookings = Math.max(...bookingTrends.map(d => d.bookings), 1);
                            return (
                              <div key={day.day} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-gray-200 rounded-t-lg relative">
                                  <div
                                    className="bg-qc-primary rounded-t-lg transition-all duration-500"
                                    style={{ 
                                      height: `${(day.bookings / maxBookings) * 100}%`,
                                      animationDelay: `${index * 100}ms`
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600 mt-2">{day.day}</p>
                                <p className="text-xs text-gray-500">{day.bookings}</p>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Small Heatmap */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">User Activity Heatmap (Max 10 Users)</h4>
                          <div className="flex gap-1">
                            {heatmapData.map((dayData) => (
                              <div key={dayData.day} className="flex-1">
                                <div className="text-xs text-gray-500 text-center mb-1">{dayData.day}</div>
                                <div className="space-y-1">
                                  {dayData.users.map((user) => (
                                    <div
                                      key={user.userId}
                                      className={`w-full h-3 rounded-sm transition-all duration-300 ${
                                        user.active 
                                          ? user.intensity > 0.7 
                                            ? 'bg-red-500' 
                                            : user.intensity > 0.4 
                                              ? 'bg-orange-400' 
                                              : 'bg-yellow-400'
                                          : 'bg-gray-200'
                                      }`}
                                      title={`User ${user.userId}: ${user.active ? 'Active' : 'Inactive'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                              <span>No Activity</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                              <span>Low</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                              <span>Medium</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Peak Hours */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold text-qc-text mb-6">Peak Booking Hours</h3>
                        <div className="space-y-3">
                          {peakHours.map((hour) => {
                            const maxBookings = Math.max(...peakHours.map(h => h.bookings), 1);
                            return (
                              <div key={hour.hour} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-12">{hour.hour}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-qc-accent h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(hour.bookings / maxBookings) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{hour.bookings}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <h3 className="text-lg font-bold text-qc-text mb-6">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAction('addFacility')}
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-qc-primary" />
                          <span className="font-medium">Add Facility</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAction('viewBookings')}
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <BookOpen className="w-5 h-5 text-qc-primary" />
                          <span className="font-medium">View Bookings</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAction('manageCourts')}
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-qc-primary" />
                          <span className="font-medium">Manage Courts</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'facilities' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-qc-text">My Facilities</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction('addFacility')}
                        className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Facility
                      </motion.button>
                    </div>
                    
                    {facilities.length === 0 ? (
                      <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No facilities yet</h4>
                        <p className="text-gray-500">Add your first facility to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {facilities.map((facility) => (
                          <div key={facility._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-qc-text">{facility.name}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {facility.location.city}, {facility.location.state}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-600 hover:text-red-700 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{facility.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {facility.courts?.length || 0} courts
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                facility.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {facility.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Recent Bookings</h3>
                    {ownerBookings.bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No bookings yet</h4>
                        <p className="text-gray-500">Bookings will appear here once users start booking your courts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ownerBookings.bookings.slice(0, 5).map((booking: any) => (
                          <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                              <h4 className="font-medium text-qc-text">{booking.facility.name}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-qc-text">₹{booking.totalAmount}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${
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
                    )}
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

export default OwnerDashboard;
