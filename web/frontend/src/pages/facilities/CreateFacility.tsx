import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  Building2, 
  Save,
  Plus,
  Trash2,
  DollarSign,
  Settings
} from 'lucide-react';
import { AppDispatch } from '@/redux/store';
import { createFacility } from '@/redux/slices/facilitySlice';
import { toast } from 'react-hot-toast';

interface CourtData {
  name: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
}

interface FormData {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images: File[];
  amenities: string[];
  pricing: {
    basePrice: number;
    peakHourPrice: number;
    weekendPrice: number;
    currency: string;
  };
  courts: CourtData[];
}

const CreateFacility: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    images: [],
    amenities: [],
    pricing: {
      basePrice: 0,
      peakHourPrice: 0,
      weekendPrice: 0,
      currency: 'INR'
    },
    courts: []
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newCourt, setNewCourt] = useState<CourtData>({
    name: '',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    pricePerHour: 0
  });

  const sportTypes = [
    'Badminton',
    'Tennis', 
    'Basketball',
    'Squash',
    'Volleyball',
    'Other'
  ];

  const surfaceTypes = [
    'Hard Court',
    'Clay',
    'Grass', 
    'Synthetic',
    'Wood',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'location') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [child]: value
          }
        }));
      } else if (parent === 'pricing') {
        setFormData(prev => ({
          ...prev,
          pricing: {
            ...prev.pricing,
            [child]: child === 'basePrice' || child === 'peakHourPrice' || child === 'weekendPrice' 
              ? Number(value) 
              : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCourtInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourt(prev => ({
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

  const addCourt = () => {
    if (!newCourt.name || !newCourt.sportType || !newCourt.surfaceType || newCourt.pricePerHour <= 0) {
      toast.error('Please fill in all court details including name, sport type, surface type, and price');
      return;
    }

    setFormData(prev => ({
      ...prev,
      courts: [...prev.courts, { ...newCourt }]
    }));

    // Reset new court form
    setNewCourt({
      name: '',
      sportType: 'Badminton',
      surfaceType: 'Synthetic',
      pricePerHour: 0
    });

    toast.success('Court added successfully!');
  };

  const removeCourt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.location.address || !formData.pricing.basePrice) {
      toast.error('Please fill in all required fields including base price');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (formData.courts.length === 0) {
      toast.error('Please add at least one court to your facility');
      return;
    }

    setLoading(true);
    try {
      await dispatch(createFacility(formData)).unwrap();
      toast.success('Facility created successfully!');
      navigate('/owner-dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/owner-dashboard');
  };

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
              <h1 className="text-2xl font-bold text-qc-text">Create New Facility</h1>
              <p className="text-gray-600 mt-1">Add a new sports facility to your portfolio</p>
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
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter facility name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Describe your facility"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter state"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter ZIP code"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Facility Images</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload facility images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
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

          {/* Pricing Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price per Hour *
                </label>
                <input
                  type="number"
                  name="pricing.basePrice"
                  value={formData.pricing.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter base price per hour"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peak Hour Price (Optional)
                </label>
                <input
                  type="number"
                  name="pricing.peakHourPrice"
                  value={formData.pricing.peakHourPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter peak hour price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekend Price (Optional)
                </label>
                <input
                  type="number"
                  name="pricing.weekendPrice"
                  value={formData.pricing.weekendPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Enter weekend price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="pricing.currency"
                  value={formData.pricing.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6">Amenities</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Add an amenity (e.g., Parking, WiFi, AC)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Courts */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-qc-text mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Courts
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  value={newCourt.name}
                  onChange={handleCourtInputChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Court Name"
                  required
                />
                <select
                  name="sportType"
                  value={newCourt.sportType}
                  onChange={handleCourtInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  required
                >
                  {sportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  name="surfaceType"
                  value={newCourt.surfaceType}
                  onChange={handleCourtInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  required
                >
                  {surfaceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="pricePerHour"
                  value={newCourt.pricePerHour}
                  onChange={handleCourtInputChange}
                  min="0"
                  step="0.01"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                  placeholder="Price per Hour"
                  required
                />
                <button
                  type="button"
                  onClick={addCourt}
                  className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.courts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.courts.map((court, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{court.name}</p>
                        <p className="text-xs text-gray-600">{court.sportType} - {court.surfaceType}</p>
                        <p className="text-sm font-semibold text-qc-primary">${court.pricePerHour}/hour</p>
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Facility
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateFacility;
