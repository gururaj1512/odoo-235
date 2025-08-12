import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building2,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchOwnerBookings, fetchOwnerAnalytics, updateBookingStatusByOwner } from '@/redux/slices/bookingSlice';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

const OwnerBookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { ownerBookings, analytics } = useSelector((state: RootState) => state.bookings);
  const { facilities } = useSelector((state: RootState) => state.facilities);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (user?.role === 'Owner') {
      dispatch(fetchFacilities({}));
      loadBookings();
      loadAnalytics();
    }
  }, [dispatch, user]);

  const loadBookings = () => {
    const params: any = {
      page: currentPage,
      limit: 20
    };

    if (statusFilter !== 'all') params.status = statusFilter;
    if (facilityFilter !== 'all') params.facilityId = facilityFilter;
    if (dateFilter) params.date = dateFilter;

    dispatch(fetchOwnerBookings(params));
  };

  const loadAnalytics = () => {
    const params: any = { period: selectedPeriod };
    if (facilityFilter !== 'all') params.facilityId = facilityFilter;
    dispatch(fetchOwnerAnalytics(params));
  };

  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter, facilityFilter, dateFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, facilityFilter]);

  const handleStatusUpdate = async (bookingId: string, status: string, reason?: string) => {
    try {
      await dispatch(updateBookingStatusByOwner({ bookingId, data: { status, reason } })).unwrap();
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      loadBookings(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = ownerBookings.bookings.filter(booking => {
    const matchesSearch = 
      booking.facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (ownerBookings.loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage bookings for your facilities</p>
            </div>
            
            <div className="flex gap-3">
              {ownerBookings.summary?.statusCounts?.Pending > 0 && (
                <div className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {ownerBookings.summary.statusCounts.Pending} Pending Bookings
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showAnalytics
                    ? 'bg-qc-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => {
                  loadBookings();
                  loadAnalytics();
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {ownerBookings.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-qc-text">{ownerBookings.pagination?.totalCount || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-qc-primary" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-qc-text">
                    {formatCurrency(ownerBookings.summary.totalEarnings || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {ownerBookings.summary.statusCounts?.Pending || 0}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {ownerBookings.summary.statusCounts?.Confirmed || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-qc-text">Analytics</h2>
              <div className="flex gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {analytics.loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sport Analytics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-qc-text mb-3">Top Sports</h3>
                  <div className="space-y-2">
                    {analytics.sportAnalytics.slice(0, 3).map((sport, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{sport._id}</span>
                        <span className="font-medium">{sport.bookings}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facility Analytics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-qc-text mb-3">Top Facilities</h3>
                  <div className="space-y-2">
                    {analytics.facilityAnalytics.slice(0, 3).map((facility, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">{facility.facilityName}</span>
                        <span className="font-medium">{formatCurrency(facility.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-qc-text mb-3">Status Distribution</h3>
                  <div className="space-y-2">
                    {analytics.statusDistribution.map((status, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{status._id}</span>
                        <span className="font-medium">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-qc-text mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">
                        {formatCurrency(analytics.facilityAnalytics.reduce((sum, f) => sum + f.revenue, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Bookings:</span>
                      <span className="font-medium">
                        {analytics.sportAnalytics.reduce((sum, s) => sum + s.bookings, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Facility Filter */}
            <div>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              >
                <option value="all">All Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility._id} value={facility._id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-qc-text">Recent Bookings</h2>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-qc-text">{booking.user.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)} ${booking.status === 'Pending' ? 'animate-pulse' : ''}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                          {booking.status === 'Pending' && (
                            <span className="ml-1 text-xs">(Action Required)</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{booking.facility.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🏸</span>
                          <span>{booking.court.name} ({booking.court.sportType})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.date)} at {formatTime(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (optional):');
                              handleStatusUpdate(booking._id, 'Cancelled', reason || undefined);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {ownerBookings.pagination && (
          <div className="mt-8">
            <Pagination
              currentPage={ownerBookings.pagination.currentPage}
              totalPages={ownerBookings.pagination.totalPages}
              hasNextPage={ownerBookings.pagination.hasNextPage}
              hasPrevPage={ownerBookings.pagination.hasPrevPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
