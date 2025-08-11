import React, { useState } from 'react';
import { X, Clock, DollarSign, MapPin } from 'lucide-react';

interface FilterPanelProps {
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose }) => {
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [priceRange, setPriceRange] = useState([500, 1500]);
  const [radius, setRadius] = useState(5);
  const [timeSlot, setTimeSlot] = useState('any');
  const [amenities, setAmenities] = useState<string[]>([]);

  const sports = ['Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball'];
  const availableAmenities = ['AC', 'Parking', 'Shower', 'Cafe', 'Equipment Rental'];
  const timeSlots = [
    { value: 'any', label: 'Any time' },
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 10PM)' },
  ];

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
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
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-qc-primary"
            />
            <div className="text-sm text-gray-600 text-center">
              Within {radius} km
            </div>
          </div>
        </div>

        {/* Time Slot */}
        <div>
          <h4 className="font-semibold text-qc-text mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Time
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
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-qc-text mb-3">Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {availableAmenities.map(amenity => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                amenities.includes(amenity)
                  ? 'bg-qc-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button 
          onClick={onClose}
          className="px-6 py-2 text-qc-text border border-gray-300 rounded-qc-radius hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-qc-primary text-white rounded-qc-radius hover:bg-qc-primary/90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
