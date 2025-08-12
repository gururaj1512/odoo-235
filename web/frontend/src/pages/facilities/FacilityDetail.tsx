import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  ShowerHead, 
  Coffee, 
  Phone,
  Mail,
  Globe,
  Calendar,
  ArrowLeft,
  Heart,
  Share2,
  BookOpen,
  Star as StarIcon,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacility, deleteFacility } from '@/redux/slices/facilitySlice';
import { getFacilityRatings, addRating, deleteRating } from '@/redux/slices/ratingSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DeleteConfirmation from '@/components/common/DeleteConfirmation';
import WeatherWidget from '@/components/WeatherWidget';
import { toast } from 'react-hot-toast';

const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentFacility, loading } = useSelector((state: RootState) => state.facilities);
  const { user } = useSelector((state: RootState) => state.auth);
  const { ratings, loading: ratingsLoading } = useSelector((state: RootState) => state.ratings);
  
  // Use facility's average rating from API or fallback to Redux state
  const averageRating = (currentFacility as any)?.averageRating || 0;
  const totalRatings = (currentFacility as any)?.totalRatings || 0;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' });
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchFacility(id));
      dispatch(getFacilityRatings({ facilityId: id }));
    }
  }, [dispatch, id]);

  const handleAddRating = async () => {
    if (!id || !user) return;
    
    setIsSubmittingRating(true);
    try {
      await dispatch(addRating({
        facilityId: id,
        rating: ratingForm.rating,
        review: ratingForm.review
      })).unwrap();
      
      // Refresh ratings to get the updated list
      dispatch(getFacilityRatings({ facilityId: id }));
      setShowRatingModal(false);
      setRatingForm({ rating: 5, review: '' });
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to add rating:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    try {
      await dispatch(deleteRating(ratingId)).unwrap();
      // Refresh ratings to get the updated list
      if (id) {
        dispatch(getFacilityRatings({ facilityId: id }));
      }
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Failed to delete rating:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  // Use real facility data instead of mock data
  const facility = currentFacility || {
    _id: id,
    name: 'Loading...',
    description: 'Loading facility details...',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    images: [],
    rating: 0,
    totalReviews: 0,
    courts: [],
    amenities: [],
    operatingHours: {},
    contact: {
      phone: undefined,
      email: undefined,
      website: undefined
    },
    reviews: [],
    pricing: {
      basePrice: 0,
      peakHourPrice: 0,
      weekendPrice: 0,
      currency: 'INR'
    }
  };

  const handleBookNow = (court: any) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login');
      return;
    }
    
    // Navigate to booking creation page with court data
    const bookingData = {
      courtId: court._id,
      courtName: court.name,
      courtImage: court.images[0],
      sportType: court.sportType,
      surfaceType: court.surfaceType,
      pricePerHour: court.pricePerHour,
      facilityName: facility.name,
      facilityLocation: `${facility.location.city}, ${facility.location.state}`,
      date: '',
      startTime: '',
      duration: 1,
      totalAmount: court.pricePerHour
    };
    
    navigate('/bookings/create', { state: { bookingData } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/facilities/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteFacility(id)).unwrap();
      navigate('/facilities');
    } catch (error) {
      console.error('Failed to delete facility:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'AC': '❄️',
      'Parking': <Car className="w-5 h-5" />,
      'Shower': <ShowerHead className="w-5 h-5" />,
      'Cafe': <Coffee className="w-5 h-5" />,
      'WiFi': <Wifi className="w-5 h-5" />,
      'Equipment Rental': '🏸',
      'Locker Rooms': '🔒',
      'First Aid': '🏥'
    };
    return iconMap[amenity] || '✅';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-qc-text">{facility.name}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {facility.location.address}, {facility.location.city}, {facility.location.state}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Owner Actions */}
              {user?.role === 'Owner' && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit Facility"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
              <div className="relative h-96">
                <img
                  src={facility.images[0]}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {facility.images.slice(1, 4).map((image: string, index: number) => (
                    <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'courts', label: 'Courts' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'booking', label: 'Book Now' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-qc-primary text-qc-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'overview' && (
                      <div>
                        {/* Weather Note */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                              <span className="text-blue-600 text-lg">🌤️</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900 text-lg mb-2">Weather Check</h4>
                              <p className="text-blue-700 leading-relaxed">
                                Check the weather widget on the right to see current conditions and get personalized sport suggestions 
                                based on the weather. Perfect for planning your game!
                              </p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-qc-text mb-4">About {facility.name}</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">{facility.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-qc-text mb-3">Operating Hours</h4>
                            <div className="space-y-2">
                              {facility.operatingHours ? (
                                Object.entries(facility.operatingHours).map(([day, hours]) => (
                                  <div key={day} className="flex justify-between text-sm">
                                    <span className="capitalize text-gray-600">{day}</span>
                                    <span className="font-medium">{hours}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500">Operating hours not available</div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-qc-text mb-3">Contact Information</h4>
                            <div className="space-y-2">
                              {facility.contact?.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{facility.contact.phone}</span>
                                </div>
                              )}
                              {facility.contact?.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span>{facility.contact.email}</span>
                                </div>
                              )}
                              {facility.contact?.website && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="w-4 h-4 text-gray-500" />
                                  <span>{facility.contact.website}</span>
                                </div>
                              )}
                              {!facility.contact?.phone && !facility.contact?.email && !facility.contact?.website && (
                                <div className="text-sm text-gray-500">Contact information not available</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'courts' && (
                      <div>
                        <h3 className="text-xl font-bold text-qc-text mb-6">Available Courts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(facility.courts || []).map((court: any) => (
                            <div key={court._id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="relative h-48">
                                <img
                                  src={court.images[0]}
                                  alt={court.name}
                                  className="w-full h-full object-cover"
                                />
                                {!court.isAvailable && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white font-semibold">Not Available</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-qc-text mb-2">{court.name}</h4>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                  <span>{court.sportType}</span>
                                  <span>{court.surfaceType}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-qc-text">
                                    ₹{facility.pricing?.basePrice || court.pricePerHour}/hour
                                  </span>
                                  <button
                                    onClick={() => handleBookNow(court)}
                                    disabled={!court.isAvailable}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                      court.isAvailable
                                        ? 'bg-qc-primary text-white hover:bg-qc-primary/90'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {court.isAvailable ? 'Book Now' : 'Unavailable'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'amenities' && (
                      <div>
                        <h3 className="text-xl font-bold text-qc-text mb-6">Amenities & Facilities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {(facility.amenities || []).map((amenity: string) => (
                            <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-lg">{getAmenityIcon(amenity)}</span>
                              <span className="font-medium text-qc-text">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-qc-text">Reviews</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="font-bold text-qc-text">{averageRating.toFixed(1)}</span>
                              </div>
                              <span className="text-gray-600">({totalRatings} reviews)</span>
                            </div>
                            {user && (
                              <button
                                onClick={() => setShowRatingModal(true)}
                                className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                              >
                                Add Review
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {ratingsLoading ? (
                          <div className="text-center py-8">
                            <LoadingSpinner />
                          </div>
                        ) : ratings.length === 0 ? (
                          <div className="text-center py-8">
                            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h4>
                            <p className="text-gray-500">Be the first to review this facility!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {ratings.map((rating) => (
                              <div key={rating._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-qc-primary rounded-full flex items-center justify-center text-white font-bold">
                                      {rating.user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-qc-text">{rating.user.name}</h4>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <StarIcon
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                      {new Date(rating.createdAt).toLocaleDateString()}
                                    </span>
                                    {user && rating.user._id === user._id && (
                                      <button
                                        onClick={() => handleDeleteRating(rating._id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete review"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-600">{rating.review}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'booking' && (
                      <div>
                        <h3 className="text-xl font-bold text-qc-text mb-6">Book a Court</h3>
                        
                        {/* Weather Note for Booking */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                              <span className="text-blue-600 text-lg">🌤️</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900 text-lg mb-2">Weather Check</h4>
                              <p className="text-blue-700 leading-relaxed">
                                Check the weather widget on the right before booking to ensure ideal conditions for your sport. 
                                We'll suggest the best activities based on current weather!
                              </p>
                            </div>
                          </div>
                        </div>
                        {selectedCourt ? (
                          <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-4 mb-6">
                              <img
                                src={selectedCourt.images[0]}
                                alt={selectedCourt.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-qc-text">{selectedCourt.name}</h4>
                                <p className="text-gray-600">{selectedCourt.sportType} • {selectedCourt.surfaceType}</p>
                                <p className="text-lg font-bold text-qc-text">₹{selectedCourt.pricePerHour}/hour</p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                  type="date"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                                    <button
                                      key={time}
                                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:border-qc-primary hover:bg-qc-primary/5 transition-colors"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary">
                                  <option>1 hour</option>
                                  <option>2 hours</option>
                                  <option>3 hours</option>
                                </select>
                              </div>
                              
                              <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="font-medium">Total Amount:</span>
                                  <span className="text-xl font-bold text-qc-text">₹{selectedCourt.pricePerHour}</span>
                                </div>
                                
                                <button 
                                  onClick={() => {
                                    const bookingData = {
                                      courtId: selectedCourt._id,
                                      courtName: selectedCourt.name,
                                      courtImage: selectedCourt.images[0],
                                      sportType: selectedCourt.sportType,
                                      surfaceType: selectedCourt.surfaceType,
                                      pricePerHour: facility.pricing?.basePrice || selectedCourt.pricePerHour,
                                      facilityName: facility.name,
                                      facilityLocation: `${facility.location.city}, ${facility.location.state}`,
                                      date: (document.querySelector('input[name="date"]') as HTMLInputElement)?.value || '',
                                      startTime: (document.querySelector('select[name="startTime"]') as HTMLSelectElement)?.value || '',
                                      duration: Number((document.querySelector('select[name="duration"]') as HTMLSelectElement)?.value) || 1,
                                      totalAmount: (facility.pricing?.basePrice || selectedCourt.pricePerHour) * (Number((document.querySelector('select[name="duration"]') as HTMLSelectElement)?.value) || 1)
                                    };
                                    navigate('/bookings/create', { state: { bookingData } });
                                  }}
                                  className="w-full bg-qc-primary text-white py-3 rounded-lg font-medium hover:bg-qc-primary/90 transition-colors"
                                >
                                  Confirm Booking
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-600 mb-2">Select a court to book</h4>
                            <p className="text-gray-500">Choose from the available courts to make your booking</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Rating Card */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-qc-text">{averageRating.toFixed(1)}</p>
                  <p className="text-gray-600">({totalRatings} reviews)</p>
                </div>
              </div>

              {/* Weather Widget */}
              <WeatherWidget 
                city={`${facility.location.city}, ${facility.location.state}`}
              />

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-qc-text mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      
                      // Find first available court
                      const availableCourt = (facility.courts || []).find((court: any) => court.isAvailable);
                      if (availableCourt) {
                        handleBookNow(availableCourt);
                      } else {
                        // If no available courts, show courts tab
                        setActiveTab('courts');
                      }
                    }}
                    className="w-full bg-qc-primary text-white py-3 rounded-lg font-medium hover:bg-qc-primary/90 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Book Now
                  </button>

                </div>
              </div>

              {/* Pricing Information */}
              {facility.pricing && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="font-semibold text-qc-text mb-4">Pricing Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-medium text-qc-text">₹{facility.pricing.basePrice}/hour</span>
                    </div>
                    {facility.pricing.peakHourPrice && facility.pricing.peakHourPrice > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Peak Hour Price:</span>
                        <span className="font-medium text-qc-text">₹{facility.pricing.peakHourPrice}/hour</span>
                      </div>
                    )}
                    {facility.pricing.weekendPrice && facility.pricing.weekendPrice > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Weekend Price:</span>
                        <span className="font-medium text-qc-text">₹{facility.pricing.weekendPrice}/hour</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Currency:</span>
                      <span className="font-medium text-qc-text">{facility.pricing.currency || 'INR'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Facility Info */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-qc-text mb-4">Facility Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">Open Now</p>
                      <p className="text-xs text-gray-600">6:00 AM - 11:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">{(facility.courts || []).length} Courts</p>
                      <p className="text-xs text-gray-600">Available for booking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">Verified Facility</p>
                      <p className="text-xs text-gray-600">Quality assured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Facility"
        message="Are you sure you want to delete the facility"
        itemName={facility.name}
        isLoading={isDeleting}
      />

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-qc-text">Add Review</h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        className={`text-2xl ${
                          star <= ratingForm.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                  <textarea
                    value={ratingForm.review}
                    onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                    placeholder="Share your experience with this facility..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {ratingForm.review.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRating}
                    disabled={isSubmittingRating || !ratingForm.review.trim()}
                    className="flex-1 px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilityDetail;
