import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { createBooking } from '@/redux/slices/bookingSlice';
import { fetchFacility } from '@/redux/slices/facilitySlice';
import { toast } from 'react-hot-toast';
import { BookingDetails } from '@/types';
import AvailableTimeSlots from '@/components/AvailableTimeSlots';
import WeatherWidget from '@/components/WeatherWidget';

interface BookingFormData {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
}

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.bookings);
  const { currentFacility, loading: facilityLoading } = useSelector((state: RootState) => state.facilities);
  
  const [formData, setFormData] = useState<BookingFormData>({
    courtId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 1,
    totalAmount: 0
  });

  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startTime: string; endTime: string } | undefined>();

  // Get booking data from location state (if coming from facility detail)
  const bookingData = location.state?.bookingData as BookingDetails | undefined;
  
  // Get facility ID from URL parameters
  const facilityId = searchParams.get('facility');

  // Fetch facility data if facilityId is provided in URL
  useEffect(() => {
    if (facilityId && !bookingData) {
      dispatch(fetchFacility(facilityId));
    }
  }, [facilityId, bookingData, dispatch]);

  useEffect(() => {
    if (bookingData) {
      const duration = bookingData.duration || 1;
      const basePrice = bookingData.pricePerHour || 0;
      // Use the passed totalAmount if available, otherwise calculate it
      const calculatedTotal = bookingData.totalAmount || (basePrice * duration);
      
      // Calculate endTime if startTime is provided
      let calculatedEndTime = bookingData.endTime || '';
      if (bookingData.startTime) {
        const startTime = new Date(`2000-01-01T${bookingData.startTime}:00`);
        const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));
        calculatedEndTime = endTime.toTimeString().slice(0, 5);
      }
      
      
      
      setFormData({
        courtId: bookingData.courtId || '',
        date: bookingData.date || '',
        startTime: bookingData.startTime || '',
        endTime: calculatedEndTime,
        duration: duration,
        totalAmount: calculatedTotal
      });
    }
  }, [bookingData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate endTime when startTime changes
    if (name === 'startTime' && value) {
      const startTime = new Date(`2000-01-01T${value}:00`);
      const endTime = new Date(startTime.getTime() + (formData.duration * 60 * 60 * 1000));
      const endTimeString = endTime.toTimeString().slice(0, 5);
      
      setFormData(prev => ({
        ...prev,
        endTime: endTimeString
      }));
    }

    // Update total amount when court is selected
    if (name === 'courtId' && value) {
      const selectedCourt = currentFacility?.courts?.find((court: any) => court._id === value);
      if (selectedCourt) {
        const newTotalAmount = selectedCourt.pricePerHour * formData.duration;
        setFormData(prev => ({
          ...prev,
          totalAmount: newTotalAmount
        }));
      }
    }
  };

  const handleDurationChange = (duration: number) => {
    // Use selected court price if available, otherwise use facility base price
    let basePrice = 0;
    if (formData.courtId && currentFacility?.courts) {
      const selectedCourt = currentFacility.courts.find((court: any) => court._id === formData.courtId);
      basePrice = selectedCourt?.pricePerHour || 0;
    } else {
      // For facility-level booking, use the facility's base price
      basePrice = currentFacility?.pricing?.basePrice || bookingData?.pricePerHour || 0;
    }
    
    const newTotalAmount = basePrice * duration;
    
    // Calculate new endTime based on duration
    let newEndTime = '';
    if (formData.startTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));
      newEndTime = endTime.toTimeString().slice(0, 5);
    }
    
    setFormData(prev => ({
      ...prev,
      duration,
      totalAmount: newTotalAmount,
      endTime: newEndTime
    }));
  };

  // Recalculate total amount when duration changes
  useEffect(() => {
    let basePrice = 0;
    if (formData.courtId && currentFacility?.courts) {
      const selectedCourt = currentFacility.courts.find((court: any) => court._id === formData.courtId);
      basePrice = selectedCourt?.pricePerHour || 0;
    } else {
      basePrice = currentFacility?.pricing?.basePrice || bookingData?.pricePerHour || 0;
    }
    
    if (basePrice > 0) {
      const newTotalAmount = basePrice * formData.duration;
      setFormData(prev => ({
        ...prev,
        totalAmount: newTotalAmount
      }));
    }
  }, [formData.duration, formData.courtId, bookingData?.pricePerHour, currentFacility?.pricing?.basePrice, currentFacility?.courts]);

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime
    }));
    setSelectedTimeSlot({ startTime, endTime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if we have either a court selected or a facility ID
    if (!formData.courtId && !facilityId) {
      toast.error('Please select a court or facility');
      return;
    }

    // Validate that start time is before end time
    if (formData.startTime >= formData.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    // Validate that date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Cannot book for past dates');
      return;
    }

    try {
      const bookingData = {
        courtId: formData.courtId || '',
        facilityId: facilityId || '',
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        totalAmount: formData.totalAmount
      };
      
      
      
      await dispatch(createBooking(bookingData)).unwrap();
      
      toast.success('Booking created successfully!');
      navigate('/bookings');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const availableTimes = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
              <h1 className="text-2xl font-bold text-qc-text">Create Booking</h1>
              <p className="text-gray-600 mt-1">Book your preferred court and time slot</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <h2 className="text-xl font-bold text-qc-text mb-6">Booking Details</h2>
              
              {/* Weather Note */}
              {(bookingData || currentFacility) && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                      <span className="text-blue-600 text-lg">🌤️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 text-lg mb-2">Weather Check</h4>
                      <p className="text-blue-700 leading-relaxed">
                        Check the weather widget on the right to see if conditions are ideal for your sport. 
                        We'll suggest the best activities based on current weather conditions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Court Selection */}
                {bookingData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-qc-text mb-3">Selected Court</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={bookingData.courtImage || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop'}
                        alt="Court"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-qc-text">{bookingData.courtName}</h4>
                        <p className="text-sm text-gray-600">{bookingData.sportType} • {bookingData.surfaceType}</p>
                        <p className="text-lg font-bold text-qc-text">₹{bookingData.pricePerHour}/hour</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Facility Information (when loaded from URL) */}
                {currentFacility && !bookingData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-qc-text mb-3">Selected Facility</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={currentFacility.images?.[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop'}
                        alt="Facility"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-qc-text">{currentFacility.name}</h4>
                        <p className="text-sm text-gray-600">{currentFacility.location.city}, {currentFacility.location.state}</p>
                        <p className="text-lg font-bold text-qc-text">₹{currentFacility.pricing?.basePrice || 0}/hour</p>
                      </div>
                    </div>
                    
                    {/* Court Selection for Facility */}
                    {currentFacility.courts && currentFacility.courts.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Court (Optional)
                        </label>
                        <select
                          name="courtId"
                          value={formData.courtId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                        >
                          <option value="">Any available court (recommended)</option>
                          {currentFacility.courts.map((court: any) => (
                            <option key={court._id} value={court._id}>
                              {court.name} - {court.sportType} (₹{court.pricePerHour}/hour)
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-600 mt-1">
                          Leave as "Any available court" to let us assign the best available court for you
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {facilityLoading && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-qc-primary" />
                      <div>
                        <h3 className="font-semibold text-qc-text">Loading facility details...</h3>
                        <p className="text-sm text-gray-600">Please wait while we fetch the facility information</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                    required
                  />
                </div>

                {/* Available Time Slots */}
                {formData.date && (formData.courtId || (currentFacility && currentFacility.courts && currentFacility.courts.length > 0)) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-qc-text">Available Time Slots</h3>
                      <button
                        type="button"
                        onClick={() => setShowTimeSlots(!showTimeSlots)}
                        className="text-sm text-qc-primary hover:text-qc-primary/80 transition-colors"
                      >
                        {showTimeSlots ? 'Hide' : 'Show'} Available Slots
                      </button>
                    </div>
                    
                    {showTimeSlots && (
                      <AvailableTimeSlots
                        courtId={formData.courtId || (currentFacility?.courts?.[0]?._id || '')}
                        selectedDate={formData.date}
                        onTimeSlotSelect={handleTimeSlotSelect}
                        selectedTimeSlot={selectedTimeSlot}
                      />
                    )}
                  </div>
                )}

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <select
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                      required
                    >
                      <option value="">Select start time</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                    </select>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-qc-text">
                      ₹{formData.totalAmount}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      let basePrice = 0;
                      let priceSource = '';
                      
                      if (formData.courtId && currentFacility?.courts) {
                        const selectedCourt = currentFacility.courts.find((court: any) => court._id === formData.courtId);
                        basePrice = selectedCourt?.pricePerHour || 0;
                        priceSource = selectedCourt?.name || 'Selected Court';
                      } else {
                        basePrice = currentFacility?.pricing?.basePrice || bookingData?.pricePerHour || 0;
                        priceSource = currentFacility?.name || 'Facility Base Price';
                      }
                      
                      return (
                        <>
                          <p>Base Price: ₹{basePrice}/hour ({priceSource})</p>
                          <p>Duration: {formData.duration} hour{formData.duration > 1 ? 's' : ''}</p>
                          <p>Calculation: ₹{basePrice} × {formData.duration} = ₹{formData.totalAmount}</p>
                          {!formData.courtId && (
                            <p className="text-blue-600 font-medium">
                              💡 We'll assign the best available court for you
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-qc-primary text-white py-3 rounded-lg font-medium hover:bg-qc-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Creating Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </motion.form>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Weather Widget */}
              {(bookingData || currentFacility) && (
                <WeatherWidget 
                  city={
                    bookingData?.facilityLocation || 
                    (currentFacility ? `${currentFacility.location.city}, ${currentFacility.location.state}` : '')
                  }
                />
              )}

              {/* Booking Summary */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-qc-text mb-4">Booking Summary</h3>
              
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {(bookingData || currentFacility) && (
                    <>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-qc-text">
                            {bookingData?.facilityName || currentFacility?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {bookingData?.facilityLocation || `${currentFacility?.location.city}, ${currentFacility?.location.state}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-qc-text">Date</p>
                          <p className="text-xs text-gray-600">{formData.date || 'Not selected'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-qc-text">Time</p>
                          <p className="text-xs text-gray-600">
                            {formData.startTime ? `${formData.startTime} (${formData.duration} hour${formData.duration > 1 ? 's' : ''})` : 'Not selected'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-qc-text">Total</p>
                          <p className="text-xs text-gray-600">₹{formData.totalAmount}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Booking will be confirmed immediately</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span>Free cancellation up to 2 hours before</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
