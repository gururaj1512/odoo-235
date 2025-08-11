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
  Activity,
  Trash2
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  fetchAdminStats,
  fetchUserTrends,
  fetchBookingTrends,
  fetchActiveSports,
  fetchRecentUsers,
  fetchPendingFacilities,
  banUser,
  deleteUser,
  approveFacility
} from '@/redux/slices/adminSlice';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    stats: globalStats, 
    userTrends, 
    bookingTrends, 
    activeSports, 
    recentUsers, 
    pendingFacilities,
    loading 
  } = useSelector((state: RootState) => state.admin);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Fetch data on component mount
  useEffect(() => {
    if (user?.email === 'user81@gmail.com') {
      dispatch(fetchAdminStats());
      dispatch(fetchUserTrends(selectedPeriod));
      dispatch(fetchBookingTrends(selectedPeriod));
      dispatch(fetchActiveSports());
      dispatch(fetchRecentUsers(10));
      dispatch(fetchPendingFacilities());
    }
  }, [dispatch, user, selectedPeriod]);

  // Format data for display
  const formatUserTrends = () => {
    if (!userTrends.length) return [];
    
    return userTrends.slice(-6).map(trend => ({
      month: trend.period,
      users: trend.users,
      owners: trend.owners
    }));
  };

  const formatBookingTrends = () => {
    if (!bookingTrends.length) return [];
    
    return bookingTrends.slice(-7).map(trend => ({
      day: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: trend.bookings,
      revenue: trend.revenue
    }));
  };

  const formatActiveSports = () => {
    if (!activeSports.length) return [];
    
    return activeSports.slice(0, 5).map(sport => ({
      sport: sport.sport,
      bookings: sport.bookings,
      revenue: sport.revenue
    }));
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleFacilityAction = async (facilityId: string, action: 'approve' | 'reject') => {
    try {
      await dispatch(approveFacility({ facilityId, action })).unwrap();
      toast.success(`Facility ${action}d successfully`);
    } catch (error: any) {
      toast.error(error || `Failed to ${action} facility`);
    }
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    try {
      await dispatch(banUser({ userId, action })).unwrap();
      toast.success(`User ${action}ned successfully`);
    } catch (error: any) {
      toast.error(error || `Failed to ${action} user`);
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success('User deleted successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your platform overview</p>
            </div>
            
            <div className="flex items-center gap-3">
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
                  { id: 'bookings', label: 'Bookings', icon: BookOpen },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  { id: 'reports', label: 'Reports', icon: Activity },
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
                            <p className="text-2xl font-bold text-qc-text">{globalStats?.totalUsers?.toLocaleString() || 0}</p>
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
                            <p className="text-2xl font-bold text-qc-text">{globalStats?.totalOwners || 0}</p>
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
                            <p className="text-2xl font-bold text-qc-text">{globalStats?.totalBookings?.toLocaleString() || 0}</p>
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
                            <p className="text-2xl font-bold text-qc-text">{globalStats?.totalActiveCourts || 0}</p>
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
                            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-qc-text">{globalStats?.pendingApprovals || 0}</p>
                          </div>
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Registration Trends */}
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
                        <div className="h-64 flex items-end justify-between gap-2">
                          {formatUserTrends().map((month, index) => (
                            <div key={month.month} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-gray-200 rounded-t-lg relative h-full">
                                <div
                                  className="bg-qc-primary rounded-t-lg transition-all duration-500 absolute bottom-0 w-full"
                                  style={{ 
                                    height: `${month.users > 0 ? (month.users / Math.max(...formatUserTrends().map(t => t.users))) * 100 : 0}%`,
                                    animationDelay: `${index * 100}ms`
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Most Active Sports */}
                      <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold text-qc-text mb-6">Most Active Sports</h3>
                        <div className="space-y-4">
                          {formatActiveSports().map((sport) => (
                            <div key={sport.sport} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-qc-primary rounded-full"></div>
                                <span className="font-medium text-qc-text">{sport.sport}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-qc-text">{sport.bookings} bookings</p>
                                <p className="text-xs text-gray-600">₹{sport.revenue.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
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
                        {pendingFacilities?.length || 0} Pending
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {pendingFacilities?.map((facility) => (
                        <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-qc-text">{facility.name}</h4>
                              <p className="text-sm text-gray-600">Owner: {facility.owner?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{facility.location?.city}, {facility.location?.state}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFacilityAction(facility._id, 'approve')}
                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleFacilityAction(facility._id, 'reject')}
                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex gap-2">
                              {facility.courts?.map((court: any) => (
                                <span key={court._id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {court.sportType}
                                </span>
                              )) || []}
                            </div>
                            <span className="text-gray-600">
                              Submitted: {new Date(facility.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">User Management</h3>
                    
                    <div className="space-y-4">
                      {recentUsers?.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                      <div>
                              <h4 className="font-medium text-qc-text">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-sm text-gray-600">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Banned'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'Owner' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            <div className="flex gap-2">
                              {user.isActive ? (
                                <button
                                  onClick={() => handleUserAction(user._id, 'ban')}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                  title="Ban User"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user._id, 'unban')}
                                  className="p-2 text-green-600 hover:text-green-700 transition-colors"
                                  title="Unban User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleUserDelete(user._id)}
                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Booking Analytics</h3>
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Booking analytics coming soon</h4>
                      <p className="text-gray-500">Detailed booking analytics and insights will be available here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Platform Analytics</h3>
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Analytics dashboard coming soon</h4>
                      <p className="text-gray-500">Detailed platform analytics and insights will be available here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">Reports & Moderation</h3>
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Reports system coming soon</h4>
                      <p className="text-gray-500">User reports and moderation tools will be available here</p>
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
