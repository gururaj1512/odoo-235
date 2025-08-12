import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  DollarSign,
  MapPin,
  Building2,
  Settings,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Courts: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams<{ facilityId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { facilities, loading } = useSelector((state: RootState) => state.facilities);
  
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showAddCourt, setShowAddCourt] = useState(false);

  useEffect(() => {
    if (user?.role === 'Owner') {
      dispatch(fetchFacilities({}));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (facilityId && facilities.length > 0) {
      const facility = facilities.find(f => f._id === facilityId);
      setSelectedFacility(facility);
    } else if (facilities.length > 0) {
      // If no specific facility selected, show the first one
      setSelectedFacility(facilities[0]);
    }
  }, [facilityId, facilities]);

  const handleBack = () => {
    navigate('/owner-dashboard');
  };

  const handleAddCourt = () => {
    if (selectedFacility) {
      navigate(`/facilities/${selectedFacility._id}/courts/create`);
    } else {
      toast.error('Please select a facility first');
    }
  };

  const handleEditCourt = (courtId: string) => {
    navigate(`/courts/${courtId}/edit`);
  };

  const handleViewCourt = (courtId: string) => {
    navigate(`/courts/${courtId}`);
  };



  const getSportIcon = (sportType: string) => {
    const icons: { [key: string]: string } = {
      'Badminton': '🏸',
      'Tennis': '🎾',
      'Basketball': '🏀',
      'Football': '⚽',
      'Cricket': '🏏',
      'Squash': '🎾',
      'Volleyball': '🏐',
      'Other': '🏟️'
    };
    return icons[sportType] || '🏟️';
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-qc-text">Court Management</h1>
                <p className="text-gray-600 mt-1">Manage courts for your facilities</p>
              </div>
            </div>
            
            <button
              onClick={handleAddCourt}
              className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Court
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Facility Selector */}
        {facilities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-qc-text mb-4">Select Facility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility) => (
                <div
                  key={facility._id}
                  onClick={() => setSelectedFacility(facility)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFacility?._id === facility._id
                      ? 'border-qc-primary bg-qc-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-qc-primary" />
                    <div>
                      <h3 className="font-medium text-qc-text">{facility.name}</h3>
                      <p className="text-sm text-gray-600">{facility.location.city}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {facility.courts?.length || 0} courts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Court Management */}
        {selectedFacility ? (
          <div className="space-y-6">
            {/* Facility Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-qc-text">{selectedFacility.name}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {selectedFacility.location.address}, {selectedFacility.location.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Courts</p>
                  <p className="text-2xl font-bold text-qc-primary">
                    {selectedFacility.courts?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Courts Grid */}
            {selectedFacility.courts && selectedFacility.courts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedFacility.courts.map((court: any) => (
                  <motion.div
                    key={court._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                  >
                    {/* Court Image */}
                    <div className="relative h-48">
                      <img
                        src={court.images?.[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'}
                        alt={court.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(court.isAvailable)}`}>
                          {court.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Court Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-qc-text">{court.name}</h3>
                        <span className="text-2xl">{getSportIcon(court.sportType)}</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Sport:</span>
                          <span>{court.sportType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Surface:</span>
                          <span>{court.surfaceType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">Price:</span>
                          <span>₹{court.pricePerHour}/hour</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCourt(court._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditCourt(court._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courts yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first court to {selectedFacility.name}
                </p>
                <button
                  onClick={handleAddCourt}
                  className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Court
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600 mb-6">
              You need to create a facility first before managing courts
            </p>
            <button
              onClick={() => navigate('/facilities/create')}
              className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Facility
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courts;
