import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/facilities');
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
              <p className="text-gray-600 mt-1">Book a court - Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-qc-text mb-4">Create Booking</h2>
          <p className="text-gray-600 mb-6">The booking creation functionality is coming soon. You can book courts directly from the facility detail pages.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
          >
            Browse Facilities
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
