import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { fetchFacilities, updateFilters, clearFilters } from '@/redux/slices/facilitySlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VenueCard from '@/components/VenueCard';
import FilterPanel from '@/components/FilterPanel';
import Pagination from '@/components/common/Pagination';
import SportFilter from '@/components/SportFilter';

const Facilities: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { facilities, loading, pagination, filters } = useSelector((state: RootState) => state.facilities);
  const { user } = useSelector((state: RootState) => state.auth);
  const { popularSports } = useSelector((state: RootState) => state.sports);
  
  // Debug logging
  
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch facilities when component mounts or when filters/page changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 12,
      ...filters
    };
    dispatch(fetchFacilities(params));
  }, [dispatch, filters, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        dispatch(updateFilters({ search: searchQuery, page: 1 }));
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch, filters.search]);

  // Transform facilities data for display
  const venues = facilities.map((facility) => {
    return {
      id: facility._id,
      name: facility.name,
      location: `${facility.location.city}, ${facility.location.state}`,
      distance: 'Nearby', // Remove random distance calculation
      rating: 4.5, // Use default rating until we implement real ratings
      reviews: 0, // Use 0 until we implement real reviews
      pricePerHour: facility.pricing?.basePrice || 0,
      sport: facility.courts?.[0]?.sportType || 'Multi-Sport',
      image: facility.images?.[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      occupancy: 0, // Remove random occupancy - will be calculated from real bookings
      amenities: facility.amenities || [],
      availableSlots: 0, // Remove random slots - will be calculated from real availability
      ownerId: typeof facility.owner === 'string' ? facility.owner : facility.owner?._id,
    };
  });
  

  const handleSportChange = (sport: string | null) => {
    setSelectedSport(sport);
    dispatch(updateFilters({ 
      sport: sport === 'all' ? undefined : sport, 
      page: 1 
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    dispatch(updateFilters({ sort, page: 1 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(updateFilters({ page }));
  };

  const handleFiltersChange = (newFilters: any) => {
    dispatch(updateFilters({ ...newFilters, page: 1 }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
    setSelectedSport(null);
    setSortBy('rating');
    setCurrentPage(1);
  };

  const handleVenueSelect = (venue: any) => {
    navigate(`/facilities/${venue.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-qc-text">Sports Facilities</h1>
            <p className="text-gray-600 mt-1">Discover and book courts near you</p>
          </div>
          
          {user?.role === 'Owner' && (
            <motion.button
              onClick={() => navigate('/facilities/create')}
              className="inline-flex items-center px-4 py-2 bg-qc-primary text-white rounded-qc-radius hover:bg-qc-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </motion.button>
          )}
        </div>

        {/* Search and Filters */}
        

        {/* Sort Options and Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {pagination?.totalCount || 0} facility{(pagination?.totalCount || 0) !== 1 ? 'ies' : 'y'} found
            </p>
            {(filters.sport || filters.minPrice || filters.maxPrice || filters.amenities?.length) && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-qc-primary hover:text-qc-primary/80 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-qc-radius focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary"
            >
              <option value="rating">Rating</option>
              <option value="price">Price</option>
              <option value="distance">Distance</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Facilities Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : venues.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VenueCard
                    venue={venue}
                    onSelect={() => handleVenueSelect(venue)}
                    showOwnerActions={user?.role === 'Owner'}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-sm text-qc-primary hover:text-qc-primary/80 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Facilities;
