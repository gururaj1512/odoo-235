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
  MapPin
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { fetchBookings } from '@/redux/slices/bookingSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OwnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { bookings, loading: bookingsLoading } = useSelector((state: RootState) => state.bookings);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    if (user?.role === 'Owner') {
      dispatch(fetchFacilities());
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  // Calculate KPIs
  const totalBookings = bookings.length;
  const activeCourts = facilities.reduce((acc, facility) => acc + (facility.courts?.length || 0), 0);
  const totalEarnings = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);
  const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;

  // Mock data for charts
  const bookingTrends = [
    { day: 'Mon', bookings: 12, earnings: 2400 },
    { day: 'Tue', bookings: 19, earnings: 3800 },
    { day: 'Wed', bookings: 15, earnings: 3000 },
    { day: 'Thu', bookings: 22, earnings: 4400 },
    { day: 'Fri', bookings: 28, earnings: 5600 },
    { day: 'Sat', bookings: 35, earnings: 7000 },
    { day: 'Sun', bookings: 18, earnings: 3600 },
  ];

  const peakHours = [
    { hour: '6AM', bookings: 2 },
    { hour: '8AM', bookings: 5 },
    { hour: '10AM', bookings: 8 },
    { hour: '12PM', bookings: 12 },
    { hour: '2PM', bookings: 15 },
    { hour: '4PM', bookings: 18 },
    { hour: '6PM', bookings: 22 },
    { hour: '8PM', bookings: 16 },
    { hour: '10PM', bookings: 8 },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addFacility':
        window.location.href = '/facilities/create';
        break;
      case 'viewBookings':
        window.location.href = '/bookings';
        break;
      case 'manageCourts':
        // Navigate to court management
        break;
      default:
        break;
    }
  };

  if (facilitiesLoading || bookingsLoading) return <LoadingSpinner />;

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
                  { id: 'courts', label: 'Court Management', icon: Settings },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
                      {/* Booking Trends */}
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
                        <div className="h-64 flex items-end justify-between gap-2">
                          {bookingTrends.map((day, index) => (
                            <div key={day.day} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-gray-200 rounded-t-lg relative">
                                <div
                                  className="bg-qc-primary rounded-t-lg transition-all duration-500"
                                  style={{ 
                                    height: `${(day.bookings / 35) * 100}%`,
                                    animationDelay: `${index * 100}ms`
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-2">{day.day}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Peak Hours */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold text-qc-text mb-6">Peak Booking Hours</h3>
                        <div className="space-y-3">
                          {peakHours.map((hour) => (
                            <div key={hour.hour} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-12">{hour.hour}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-qc-accent h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(hour.bookings / 22) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-8">{hour.bookings}</span>
                            </div>
                          ))}
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
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No bookings yet</h4>
                        <p className="text-gray-500">Bookings will appear here once users start booking your courts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.slice(0, 5).map((booking) => (
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

                {activeTab === 'courts' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Court Management</h3>
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Court management coming soon</h4>
                      <p className="text-gray-500">Add, edit, and manage your courts from here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Analytics</h3>
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Analytics dashboard coming soon</h4>
                      <p className="text-gray-500">Detailed analytics and insights will be available here</p>
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

export default OwnerDashboard;
