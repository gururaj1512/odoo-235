import React from 'react';

interface OccupancyMeterProps {
  occupancy: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const OccupancyMeter: React.FC<OccupancyMeterProps> = ({ 
  occupancy, 
  size = 'medium', 
  showLabel = true 
}) => {
  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#EF4444';
    if (percentage >= 60) return '#F59E0B';
    return '#10B981';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return { width: 'w-12', height: 'h-12', text: 'text-xs' };
      case 'large': return { width: 'w-20', height: 'h-20', text: 'text-lg' };
      default: return { width: 'w-16', height: 'h-16', text: 'text-sm' };
    }
  };

  const sizeClasses = getSizeClasses();
  const color = getColor(occupancy);
  const strokeDasharray = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = strokeDasharray - (strokeDasharray * occupancy) / 100;

  return (
    <div className={`relative ${sizeClasses.width} ${sizeClasses.height} flex items-center justify-center`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-gray-800 ${sizeClasses.text}`}>
          {occupancy}%
        </span>
        {showLabel && size !== 'small' && (
          <span className="text-xs text-gray-500 font-medium">busy</span>
        )}
      </div>
    </div>
  );
};

export default OccupancyMeter;
