import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save,
  Building2,
  DollarSign,
  Settings
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import { createCourt } from '@/redux/slices/courtSlice';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CourtFormData {
  name: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
  images: File[];
}

const CreateCourt: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams<{ facilityId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { facilities, loading: facilitiesLoading } = useSelector((state: RootState) => state.facilities);
  const { loading: courtLoading } = useSelector((state: RootState) => state.courts);
  
  const [formData, setFormData] = useState<CourtFormData>({
    name: '',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    pricePerHour: 0,
    images: []
  });

  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  const sportTypes = [
    'Badminton',
    'Tennis', 
    'Basketball',
    'Squash',
    'Volleyball',
    'Cricket',
    'Football',
    'Other'
  ];

  const surfaceTypes = [
    'Hard Court',
    'Clay',
    'Grass', 
    'Synthetic',
    'Wood',
    'Carpet',
    'Other'
  ];

  useEffect(() => {
    if (user?.role === 'Owner') {
      dispatch(fetchFacilities());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (facilityId && facilities.length > 0) {
      const facility = facilities.find(f => f._id === facilityId);
      setSelectedFacility(facility);
    }
  }, [facilityId, facilities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pricePerHour' ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sportType || !formData.surfaceType || formData.pricePerHour <= 0) {
      toast.error('Please fill in all required fields including price');
      return;
    }

    if (!selectedFacility) {
      toast.error('Please select a facility');
      return;
    }

    try {
      await dispatch(createCourt({ facilityId: selectedFacility._id, data: formData })).unwrap();
      toast.success('Court created successfully!');
      navigate(`/facilities/${selectedFacility._id}/courts`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create court');
    }
  };

  const handleBack = () => {
    if (selectedFacility) {
      navigate(`/facilities/${selectedFacility._id}/courts`);
    } else {
      navigate('/courts');
    }
  };

  if (facilitiesLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-qc-text">Add New Court</h1>
              <p className="text-gray-600 mt-1">Add a new court to your facility</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Facility Selection */}
          {!selectedFacility && facilities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Select Facility
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((facility) => (
                  <div
                    key={facility._id}
                    onClick={() => setSelectedFacility(facility)}
                    className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-qc-primary transition-colors"
                  >
                    <h3 className="font-medium text-qc-text">{facility.name}</h3>
                    <p className="text-sm text-gray-600">{facility.location.city}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {facility.courts?.length || 0} existing courts
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Facility Info */}
          {selectedFacility && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-qc-text mb-4">Adding Court to:</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-qc-text">{selectedFacility.name}</h3>
                <p className="text-gray-600">{selectedFacility.location.address}, {selectedFacility.location.city}</p>
              </div>
            </div>
          )}

          {/* Court Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Court Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="e.g., Court 1 - Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  required
                >
                  {sportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Type *
                </label>
                <select
                  name="surfaceType"
                  value={formData.surfaceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  required
                >
                  {surfaceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                    placeholder="Enter price per hour"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Court Images */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Court Images</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload court images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="court-image-upload"
                />
                <label
                  htmlFor="court-image-upload"
                  className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors cursor-pointer"
                >
                  Choose Files
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={courtLoading || !selectedFacility}
              className="flex items-center gap-2 px-6 py-3 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {courtLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Court
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateCourt;
