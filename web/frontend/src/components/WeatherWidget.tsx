import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Thermometer,
  Droplets,
  Activity,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { weatherApi, WeatherSuggestion } from '@/services/weatherApi';

interface WeatherWidgetProps {
  city?: string;
  lat?: number;
  lon?: number;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  city, 
  lat, 
  lon, 
  className = '' 
}) => {
  const [weatherSuggestion, setWeatherSuggestion] = useState<WeatherSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city && (!lat || !lon)) return;

      setLoading(true);
      setError(null);

      try {
        let weatherData;
        if (city) {
          weatherData = await weatherApi.getWeatherByCity(city);
        } else if (lat && lon) {
          weatherData = await weatherApi.getWeatherByCoords(lat, lon);
        } else {
          throw new Error('No location provided');
        }

        const suggestion = weatherApi.getWeatherSuggestion(weatherData);
        setWeatherSuggestion(suggestion);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, lat, lon]);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('rain')) return <CloudRain className="w-6 h-6" />;
    if (conditionLower.includes('snow')) return <CloudSnow className="w-6 h-6" />;
    if (conditionLower.includes('thunder')) return <CloudLightning className="w-6 h-6" />;
    if (conditionLower.includes('cloud')) return <Cloud className="w-6 h-6" />;
    if (conditionLower.includes('clear')) return <Sun className="w-6 h-6" />;
    if (conditionLower.includes('wind')) return <Wind className="w-6 h-6" />;
    
    return <Cloud className="w-6 h-6" />;
  };

  const getWeatherColor = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('rain') || conditionLower.includes('snow') || conditionLower.includes('thunder')) {
      return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
    }
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
    }
    if (conditionLower.includes('cloud')) {
      return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200';
    }
    
    return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border border-gray-200 shadow-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qc-primary mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-600">Loading weather data...</p>
            <p className="text-xs text-gray-500 mt-1">Fetching current conditions</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border border-red-200 shadow-lg overflow-hidden ${className}`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Weather Unavailable</h4>
              <p className="text-sm text-red-600">Unable to fetch weather data at this time</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!weatherSuggestion) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden ${className}`}
    >
      {/* Weather Header with Gradient Background */}
      <div className={`relative overflow-hidden ${getWeatherColor(weatherSuggestion.condition)}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {getWeatherIcon(weatherSuggestion.condition)}
              </motion.div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {Math.round(weatherSuggestion.temperature)}°C
                </h3>
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {weatherSuggestion.condition}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                <Thermometer className="w-3 h-3" />
                <span className="font-medium">Feels like {Math.round(weatherSuggestion.temperature)}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Status Card */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            weatherSuggestion.isGoodForOutdoor 
              ? 'bg-green-100 text-green-600' 
              : 'bg-orange-100 text-orange-600'
          }`}>
            {weatherSuggestion.isGoodForOutdoor ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-base mb-1 ${
              weatherSuggestion.isGoodForOutdoor ? 'text-green-800' : 'text-orange-800'
            }`}>
              {weatherSuggestion.isGoodForOutdoor ? 'Perfect for Outdoor Sports!' : 'Indoor Sports Recommended'}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {weatherSuggestion.weatherNote}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Sports Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-qc-primary/10 rounded-lg">
            <Activity className="w-4 h-4 text-qc-primary" />
          </div>
          <h4 className="font-semibold text-gray-900 text-base">Recommended Activities</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {weatherSuggestion.suggestedSports.map((sport, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-r from-qc-primary/5 to-qc-accent/5 border border-qc-primary/20 rounded-lg p-2 text-center hover:from-qc-primary/10 hover:to-qc-accent/10 transition-all duration-200 cursor-pointer group"
            >
              <span className="text-xs font-medium text-qc-primary group-hover:text-qc-primary/80 transition-colors">
                {sport}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer with Attribution */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Weather data by OpenWeather</span>
          </div>
          <div className="text-xs text-gray-400">
            Updated just now
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
