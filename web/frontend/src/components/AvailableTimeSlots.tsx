import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { bookingApi } from '@/services/api';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailableTimeSlotsProps {
  courtId: string;
  selectedDate: string;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  selectedTimeSlot?: { startTime: string; endTime: string };
}

const AvailableTimeSlots: React.FC<AvailableTimeSlotsProps> = ({
  courtId,
  selectedDate,
  onTimeSlotSelect,
  selectedTimeSlot
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courtId && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [courtId, selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getAvailableTimeSlots(courtId, selectedDate);
      setTimeSlots(response.data.timeSlots);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch available time slots');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qc-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchAvailableTimeSlots}
          className="mt-2 px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.isAvailable);
  const unavailableSlots = timeSlots.filter(slot => !slot.isAvailable);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-qc-text">Available Time Slots</h3>
        <button
          onClick={fetchAvailableTimeSlots}
          className="text-sm text-qc-primary hover:text-qc-primary/80 transition-colors"
        >
          Refresh
        </button>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No available time slots for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {timeSlots.map((slot, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => slot.isAvailable && onTimeSlotSelect(slot.startTime, slot.endTime)}
              disabled={!slot.isAvailable}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                slot.isAvailable
                  ? selectedTimeSlot?.startTime === slot.startTime && selectedTimeSlot?.endTime === slot.endTime
                    ? 'border-qc-primary bg-qc-primary text-white'
                    : 'border-gray-200 hover:border-qc-primary hover:bg-qc-primary/5'
                  : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {formatTime(slot.startTime)}
                </span>
                {slot.isAvailable ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="text-xs opacity-75">
                to {formatTime(slot.endTime)}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {unavailableSlots.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Unavailable Slots</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unavailableSlots.map((slot, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border-2 border-gray-100 bg-gray-50 text-gray-400"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {formatTime(slot.startTime)}
                  </span>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-xs opacity-75">
                  to {formatTime(slot.endTime)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableTimeSlots;
