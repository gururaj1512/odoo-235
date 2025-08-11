import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchPopularSports } from '@/redux/slices/sportSlice';
import { Sport } from '@/types';

interface SportFilterProps {
  selectedSport: string | null;
  onSportChange: (sportId: string | null) => void;
  className?: string;
}

const SportFilter: React.FC<SportFilterProps> = ({ 
  selectedSport, 
  onSportChange, 
  className = '' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { popularSports, loading } = useSelector((state: RootState) => state.sports);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPopularSports(10));
  }, [dispatch]);

  const handleSportSelect = (sportId: string) => {
    onSportChange(selectedSport === sportId ? null : sportId);
    setIsOpen(false);
  };

  const getSportIcon = (sportName: string) => {
    const iconMap: { [key: string]: string } = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Badminton': '🏸',
      'Cricket': '🏏',
      'Volleyball': '🏐',
      'Squash': '🏓',
      'Table Tennis': '🏓',
      'Hockey': '🏑',
      'Rugby': '🏉',
      'Baseball': '⚾',
      'Golf': '⛳',
    };
    return iconMap[sportName] || '🏃';
  };

  const selectedSportData = popularSports.find(sport => sport._id === selectedSport);

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-qc-primary focus:border-transparent"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {selectedSportData ? selectedSportData.name : 'All Sports'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Filter by Sport</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* All Sports Option */}
            <button
              onClick={() => handleSportSelect('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                !selectedSport ? 'bg-qc-primary bg-opacity-10 text-qc-primary' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🏃</span>
              <span className="text-sm font-medium">All Sports</span>
            </button>

            {/* Sport Options */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qc-primary mx-auto"></div>
                  <p className="mt-2 text-sm">Loading sports...</p>
                </div>
              ) : popularSports.length > 0 ? (
                popularSports.map((sport) => (
                  <button
                    key={sport._id}
                    onClick={() => handleSportSelect(sport._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      selectedSport === sport._id ? 'bg-qc-primary bg-opacity-10 text-qc-primary' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{getSportIcon(sport.name)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{sport.name}</span>
                      <span className="text-xs text-gray-500 truncate block">{sport.category}</span>
                    </div>
                    {sport.popularity > 0 && (
                      <span className="text-xs bg-qc-accent text-white px-2 py-1 rounded-full">
                        {sport.popularity}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No sports available</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {selectedSport ? 'Showing facilities for selected sport' : 'Showing all facilities'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SportFilter;
