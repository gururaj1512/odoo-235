import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacility, updateFacility } from '@/redux/slices/facilitySlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CourtData {
  name: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
}

const EditFacility: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentFacility, loading, error } = useSelector((state: RootState) => state.facilities);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    pricing: {
      basePrice: 0,
      peakHourPrice: 0,
      weekendPrice: 0,
      currency: 'INR'
    },
    amenities: [] as string[],
    courts: [] as CourtData[]
  });

  const [newCourt, setNewCourt] = useState<CourtData>({
    name: '',
    sportType: 'Tennis',
    surfaceType: 'Hard Court',
    pricePerHour: 0
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sportTypes = ['Tennis', 'Basketball', 'Badminton', 'Squash', 'Volleyball', 'Football', 'Cricket', 'Table Tennis', 'Other'];
  const surfaceTypes = ['Hard Court', 'Clay', 'Grass', 'Synthetic', 'Wood', 'Carpet', 'Other'];
  const currencies = ['INR', 'USD', 'EUR'];

  useEffect(() => {
    if (id) {
      dispatch(fetchFacility(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentFacility) {
      setFormData({
        name: currentFacility.name,
        description: currentFacility.description,
        location: currentFacility.location,
        pricing: currentFacility.pricing,
        amenities: currentFacility.amenities || [],
        courts: currentFacility.courts?.map(court => ({
          name: court.name,
          sportType: court.sportType,
          surfaceType: court.surfaceType,
          pricePerHour: court.pricePerHour
        })) || []
      });
      setExistingImages(currentFacility.images || []);
    }
  }, [currentFacility]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handlePricingChange = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCourtInputChange = (field: string, value: string | number) => {
    setNewCourt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCourt = () => {
    if (newCourt.name && newCourt.sportType && newCourt.surfaceType && newCourt.pricePerHour > 0) {
      setFormData(prev => ({
        ...prev,
        courts: [...prev.courts, { ...newCourt }]
      }));
      setNewCourt({
        name: '',
        sportType: 'Tennis',
        surfaceType: 'Hard Court',
        pricePerHour: 0
      });
    }
  };

  const removeCourt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        ...formData,
        images: images,
        existingImages: existingImages
      };
      
      await dispatch(updateFacility({ id, data: updateData })).unwrap();
      navigate('/owner-dashboard');
    } catch (error) {
      console.error('Failed to update facility:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Facility</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentFacility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-2">Facility Not Found</h2>
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-qc-text">Edit Facility</h1>
              <p className="text-gray-600 mt-1">Update your facility information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  value={formData.pricing.basePrice}
                  onChange={(e) => handlePricingChange('basePrice', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peak Hour Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.pricing.peakHourPrice}
                  onChange={(e) => handlePricingChange('peakHourPrice', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekend Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.pricing.weekendPrice}
                  onChange={(e) => handlePricingChange('weekendPrice', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.pricing.currency}
                  onChange={(e) => handlePricingChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Amenities</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity (e.g., AC, Parking)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Courts */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Courts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                value={newCourt.name}
                onChange={(e) => handleCourtInputChange('name', e.target.value)}
                placeholder="Court name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              />
              <select
                value={newCourt.sportType}
                onChange={(e) => handleCourtInputChange('sportType', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              >
                {sportTypes.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              <select
                value={newCourt.surfaceType}
                onChange={(e) => handleCourtInputChange('surfaceType', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              >
                {surfaceTypes.map(surface => (
                  <option key={surface} value={surface}>{surface}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newCourt.pricePerHour}
                  onChange={(e) => handleCourtInputChange('pricePerHour', Number(e.target.value))}
                  placeholder="Price/hr"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                  min="0"
                />
                <button
                  type="button"
                  onClick={addCourt}
                  className="px-3 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.courts.map((court, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{court.name}</span>
                    <span className="text-sm text-gray-600">{court.sportType}</span>
                    <span className="text-sm text-gray-600">{court.surfaceType}</span>
                    <span className="text-sm font-medium">₹{court.pricePerHour}/hr</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourt(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Images</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
              />
            </div>

            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Existing image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/owner-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Facility
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFacility;
