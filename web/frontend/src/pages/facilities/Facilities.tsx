import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  ShowerHead, 
  Coffee,
  Building2,
  Plus
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFacilities } from '@/redux/slices/facilitySlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VenueCard from '@/components/VenueCard';
import FilterPanel from '@/components/FilterPanel';
import OccupancyMeter from '@/components/OccupancyMeter';
import SportFilter from '@/components/SportFilter';

const Facilities: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { facilities, loading } = useSelector((state: RootState) => state.facilities);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const sports = [
    { name: 'All Sports', value: 'all', icon: '🏟️' },
    { name: 'Badminton', value: 'Badminton', icon: '🏸' },
    { name: 'Tennis', value: 'Tennis', icon: '🎾' },
    { name: 'Cricket', value: 'Cricket', icon: '🏏' },
    { name: 'Football', value: 'Football', icon: '⚽' },
    { name: 'Basketball', value: 'Basketball', icon: '🏀' },
  ];

  // Transform facilities data for display
  const venues = facilities.map((facility) => ({
    id: facility._id,
    name: facility.name,
    location: `${facility.location.city}, ${facility.location.state}`,
    distance: `${Math.floor(Math.random() * 10) + 1} km`,
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 500) + 50,
    pricePerHour: facility.pricing?.basePrice || Math.floor(Math.random() * 800) + 400,
    sport: facility.courts?.[0]?.sportType || 'Badminton',
    image: facility.images?.[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    occupancy: Math.floor(Math.random() * 100),
    amenities: facility.amenities || ['AC', 'Parking', 'Shower', 'Cafe'].slice(0, Math.floor(Math.random() * 4) + 1),
    availableSlots: Math.floor(Math.random() * 20) + 5,
  }));

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || venue.sport === selectedSport;
    const matchesPrice = venue.pricePerHour >= priceRange[0] && venue.pricePerHour <= priceRange[1];
    
    return matchesSearch && matchesSport && matchesPrice;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.pricePerHour - b.pricePerHour;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  const handleVenueSelect = (venue: any) => {
    // Navigate to venue detail page
    console.log('Selected venue:', venue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Sports Facilities</h1>
              <p className="text-gray-600 mt-1">Discover and book courts near you</p>
            </div>
            
            {user?.role === 'Owner' && (
              <motion.button
                className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-qc-radius hover:bg-qc-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search facilities, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-qc-radius focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors"
              />
            </div>

            {/* Sport Filter */}
            <SportFilter
              selectedSport={selectedSport}
              onSportChange={setSelectedSport}
              className="lg:w-auto"
            />

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-qc-radius transition-colors ${
                showFilters
                  ? 'bg-qc-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <FilterPanel onClose={() => setShowFilters(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {sortedVenues.length} facility{sortedVenues.length !== 1 ? 'ies' : 'y'} found
          </p>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-qc-radius focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
            >
              <option value="rating">Rating</option>
              <option value="price">Price</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>

        {/* Facilities Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : sortedVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VenueCard
                  venue={venue}
                  onSelect={() => handleVenueSelect(venue)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Facilities;
