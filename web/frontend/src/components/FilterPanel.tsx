import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, DollarSign, MapPin, Clock, Wifi } from 'lucide-react';
import { RootState } from '@/redux/store';

interface FilterPanelProps {
  onClose: () => void;
  filters: {
    sport?: string;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    radius?: number;
    timeSlot?: string;
  };
  onFiltersChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, filters, onFiltersChange }) => {
  const { popularSports } = useSelector((state: RootState) => state.sports);
  
  const [selectedSports, setSelectedSports] = useState<string[]>(filters.sport ? [filters.sport] : []);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 500, filters.maxPrice || 1500]);
  const [radius, setRadius] = useState(filters.radius || 5);
  const [timeSlot, setTimeSlot] = useState(filters.timeSlot || 'any');
  const [amenities, setAmenities] = useState<string[]>(filters.amenities || []);

  // Use sports from Redux state, fallback to common sports if not available
  const sports = popularSports?.map(sport => sport.name) || ['Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball'];
  const availableAmenities = ['AC', 'Parking', 'Shower', 'Cafe', 'Equipment Rental'];
  const timeSlots = [
    { value: 'any', label: 'Any time' },
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 10PM)' },
  ];

  const toggleSport = (sport: string) => {
    const newSports = selectedSports.includes(sport) 
      ? selectedSports.filter(s => s !== sport)
      : [...selectedSports, sport];
    setSelectedSports(newSports);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = amenities.includes(amenity) 
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    setAmenities(newAmenities);
  };

  const applyFilters = () => {
    const newFilters = {
      sport: selectedSports.length > 0 ? selectedSports[0] : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      radius,
      timeSlot,
      amenities: amenities.length > 0 ? amenities : undefined,
    };
    onFiltersChange(newFilters);
    onClose();
  };

  const clearFilters = () => {
    setSelectedSports([]);
    setPriceRange([500, 1500]);
    setRadius(5);
    setTimeSlot('any');
    setAmenities([]);
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-qc-text">Filters</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sports */}
        <div>
          <h4 className="font-semibold text-qc-text mb-3">Sport</h4>
          <div className="space-y-2">
            {sports.map(sport => (
              <label key={sport} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSports.includes(sport)}
                  onChange={() => toggleSport(sport)}
                  className="rounded border-gray-300 text-qc-primary focus:ring-qc-primary/20"
                />
                <span className="ml-2 text-sm text-gray-700">{sport}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-semibold text-qc-text mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Price Range
          </h4>
          <div className="space-y-3">
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-qc-primary"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Radius */}
        <div>
          <h4 className="font-semibold text-qc-text mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Radius
          </h4>
          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-qc-primary"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 km</span>
              <span>{radius} km</span>
            </div>
          </div>
        </div>

        {/* Time Slot */}
        <div>
          <h4 className="font-semibold text-qc-text mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Time Slot
          </h4>
          <div className="space-y-2">
            {timeSlots.map(slot => (
              <label key={slot.value} className="flex items-center">
                <input
                  type="radio"
                  name="timeSlot"
                  value={slot.value}
                  checked={timeSlot === slot.value}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="border-gray-300 text-qc-primary focus:ring-qc-primary/20"
                />
                <span className="ml-2 text-sm text-gray-700">{slot.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-6">
        <h4 className="font-semibold text-qc-text mb-3">Amenities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableAmenities.map(amenity => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="rounded border-gray-300 text-qc-primary focus:ring-qc-primary/20"
              />
              <span className="ml-2 text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
