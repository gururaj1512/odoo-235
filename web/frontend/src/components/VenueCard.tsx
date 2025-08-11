import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Users, Wifi, Car, ShowerHead, Coffee } from 'lucide-react';
import OccupancyMeter from './OccupancyMeter';

interface Venue {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  sport: string;
  image: string;
  occupancy: number;
  amenities: string[];
  availableSlots: number;
}

interface VenueCardProps {
  venue: Venue;
  onSelect: () => void;
  compact?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onSelect, compact = false }) => {
  const amenityIcons: Record<string, React.ReactNode> = {
    'AC': <Wifi className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />,
    'Shower': <ShowerHead className="w-4 h-4" />,
    'Cafe': <Coffee className="w-4 h-4" />
  };

  const getPriceColor = (occupancy: number) => {
    if (occupancy > 80) return 'text-red-600 bg-red-50';
    if (occupancy > 60) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden ${
        compact ? 'h-32' : 'h-auto'
      }`}
      onClick={onSelect}
    >
      <div className={`${compact ? 'flex' : 'block'}`}>
        {/* Image */}
        <div className={`${compact ? 'w-32 h-32' : 'h-48'} relative overflow-hidden`}>
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor(venue.occupancy)}`}>
              ₹{venue.pricePerHour}/hr
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="bg-qc-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              {venue.sport}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 ${compact ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className={compact ? 'space-y-1' : 'space-y-2'}>
              <h3 className={`font-bold text-qc-text ${compact ? 'text-sm' : 'text-lg'}`}>
                {venue.name}
              </h3>
              <div className="flex items-center text-gray-500 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{venue.location} • {venue.distance}</span>
              </div>
            </div>
            
            {!compact && (
              <div className="flex-shrink-0">
                <OccupancyMeter occupancy={venue.occupancy} size="small" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-qc-accent fill-current" />
                <span className="ml-1 text-sm font-medium text-qc-text">{venue.rating}</span>
                <span className="text-xs text-gray-500 ml-1">({venue.reviews})</span>
              </div>
              
              <div className="flex items-center text-green-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{venue.availableSlots} slots</span>
              </div>
            </div>
          </div>

          {!compact && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {venue.amenities.slice(0, 3).map((amenity, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-1 text-gray-500"
                    title={amenity}
                  >
                    {amenityIcons[amenity]}
                  </div>
                ))}
                {venue.amenities.length > 3 && (
                  <span className="text-xs text-gray-500">+{venue.amenities.length - 3}</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              to={`/facilities/${venue.id}`}
              className={`bg-qc-primary text-white font-medium rounded-qc-radius hover:bg-qc-primary/90 transition-colors ${
                compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
              }`}
            >
              View Details
            </Link>
            
            <Link
              to={`/bookings/create?facility=${venue.id}`}
              className={`bg-qc-accent text-white font-medium rounded-qc-radius hover:bg-qc-accent/90 transition-colors ${
                compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
              }`}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
