const API_KEY = '2bed468ad9cd7cec460b4ec6dfd2f58c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

export interface WeatherSuggestion {
  isGoodForOutdoor: boolean;
  suggestedSports: string[];
  weatherNote: string;
  temperature: number;
  condition: string;
}

export const weatherApi = {
  getWeatherByCity: async (city: string): Promise<WeatherData> => {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return response.json();
  },

  getWeatherByCoords: async (lat: number, lon: number): Promise<WeatherData> => {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return response.json();
  },

  getWeatherSuggestion: (weatherData: WeatherData): WeatherSuggestion => {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description.toLowerCase();
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    let isGoodForOutdoor = true;
    let suggestedSports: string[] = [];
    let weatherNote = '';

    // Temperature-based suggestions
    if (temp < 10) {
      isGoodForOutdoor = false;
      weatherNote = 'It\'s quite cold outside. Consider indoor sports or warm-up exercises.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Gym Workout', 'Swimming'];
    } else if (temp >= 10 && temp < 20) {
      weatherNote = 'Cool weather - perfect for outdoor activities!';
      suggestedSports = ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball'];
    } else if (temp >= 20 && temp < 30) {
      weatherNote = 'Pleasant weather - ideal for all outdoor sports!';
      suggestedSports = ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 'Volleyball'];
    } else if (temp >= 30 && temp < 35) {
      weatherNote = 'Warm weather - stay hydrated and take breaks!';
      suggestedSports = ['Early morning Cricket', 'Evening Football', 'Indoor Sports'];
    } else {
      isGoodForOutdoor = false;
      weatherNote = 'Very hot weather - avoid strenuous outdoor activities.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Swimming', 'Gym Workout'];
    }

    // Weather condition adjustments
    if (condition.includes('rain') || description.includes('rain')) {
      isGoodForOutdoor = false;
      weatherNote = 'Rainy weather - indoor sports recommended.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Gym Workout', 'Swimming'];
    } else if (condition.includes('snow') || description.includes('snow')) {
      isGoodForOutdoor = false;
      weatherNote = 'Snowy weather - indoor activities only.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Gym Workout'];
    } else if (condition.includes('thunderstorm') || description.includes('thunder')) {
      isGoodForOutdoor = false;
      weatherNote = 'Thunderstorm - stay indoors and avoid outdoor activities.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Gym Workout'];
    } else if (condition.includes('fog') || description.includes('fog')) {
      weatherNote = 'Foggy conditions - be careful with outdoor activities.';
      suggestedSports = ['Indoor Sports', 'Light Outdoor Activities'];
    } else if (windSpeed > 20) {
      weatherNote = 'Strong winds - may affect outdoor sports.';
      suggestedSports = ['Indoor Badminton', 'Indoor Tennis', 'Gym Workout'];
    }

    // Humidity adjustments
    if (humidity > 80) {
      weatherNote += ' High humidity - stay hydrated!';
    }

    return {
      isGoodForOutdoor,
      suggestedSports,
      weatherNote,
      temperature: temp,
      condition: weatherData.weather[0].main
    };
  }
};
