import NearbySports from '../components/NearbySports';

const NearbySportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏟️ Nearby Sports Venues
          </h1>
          <p className="text-gray-600">
            Discover sports facilities, academies, and venues in Gandhinagar and Ahmedabad
          </p>
        </div>
        
        <NearbySports />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 How to Use This Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Find Your Location</h3>
              <p className="text-sm text-gray-600">
                The blue dot shows your current location. Venues are marked with colored icons.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏏</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Filter by Sport</h3>
              <p className="text-sm text-gray-600">
                Use the filter buttons to find specific sports like cricket, football, or badminton.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Check Ratings</h3>
              <p className="text-sm text-gray-600">
                All venues include real ratings and reviews from users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbySportsPage;