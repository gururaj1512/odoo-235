import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Filter,
  Search,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Building2
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchBookings, cancelBooking } from '@/redux/slices/bookingSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookings, loading } = useSelector((state: RootState) => state.bookings);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBookings(undefined));
  }, [dispatch]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
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

  const filteredBookings = bookings.filter(booking => {
    const facilityName = booking.facility?.name || '';
    const courtName = booking.court?.name || '';
    
    const matchesSearch = facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         courtName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'upcoming' && new Date(booking.date) > new Date()) ||
                       (dateFilter === 'past' && new Date(booking.date) < new Date());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const upcomingBookings = filteredBookings.filter(booking => booking.date && new Date(booking.date) > new Date());
  const pastBookings = filteredBookings.filter(booking => booking.date && new Date(booking.date) < new Date());

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage and track your court bookings</p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/facilities'}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book New Court
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search facilities or courts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="lg:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-qc-text">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-qc-text">{upcomingBookings.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-qc-text">
                  {bookings.filter(b => b.status === 'Completed').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-qc-text">
                  ₹{bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-qc-text mb-4">Upcoming Bookings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-qc-text mb-1">{booking.facility?.name || 'Unknown Facility'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{booking.court?.name || 'Unknown Court'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'No date'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{booking.facility?.location?.city || 'Unknown Location'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-qc-text">₹{booking.totalAmount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-qc-text mb-4">Past Bookings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border p-6 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-qc-text mb-1">{booking.facility?.name || 'Unknown Facility'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{booking.court?.name || 'Unknown Court'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'No date'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{booking.facility?.location?.city || 'Unknown Location'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-qc-text">₹{booking.totalAmount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-qc-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {bookings.length === 0 
                  ? "You haven't made any bookings yet. Start by exploring our facilities!"
                  : "No bookings match your current filters. Try adjusting your search criteria."
                }
              </p>
              {bookings.length === 0 && (
                <button
                  onClick={() => window.location.href = '/facilities'}
                  className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Facilities
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
