import axios from 'axios';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  CreateFacilityData, 
  CreateCourtData, 
  CreateBookingData,
  ApiResponse,
  User,
  Facility,
  Court,
  Booking,
  Sport
} from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be sent via cookies automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect automatically, let the component handle it
      // This prevents infinite loops during authentication checks
      console.log('Unauthorized request, authentication required');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Facility API
export const facilityApi = {
  getFacilities: async (): Promise<ApiResponse<Facility[]>> => {
    const response = await api.get('/facilities');
    return response.data;
  },

  getFacility: async (id: string): Promise<ApiResponse<Facility>> => {
    const response = await api.get(`/facilities/${id}`);
    return response.data;
  },

  createFacility: async (data: CreateFacilityData): Promise<ApiResponse<Facility>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('location[address]', data.location.address);
    formData.append('location[city]', data.location.city);
    formData.append('location[state]', data.location.state);
    formData.append('location[zipCode]', data.location.zipCode);
    
    console.log('Images to upload:', data.images.length);
    data.images.forEach((image, index) => {
      console.log(`Image ${index}:`, {
        name: image.name,
        size: image.size,
        type: image.type
      });
      formData.append('images', image);
    });
    
    if (data.amenities) {
      data.amenities.forEach((amenity) => {
        formData.append('amenities[]', amenity);
      });
    }

    // Add pricing data
    if (data.pricing) {
      formData.append('pricing[basePrice]', data.pricing.basePrice.toString());
      if (data.pricing.peakHourPrice) {
        formData.append('pricing[peakHourPrice]', data.pricing.peakHourPrice.toString());
      }
      if (data.pricing.weekendPrice) {
        formData.append('pricing[weekendPrice]', data.pricing.weekendPrice.toString());
      }
      if (data.pricing.currency) {
        formData.append('pricing[currency]', data.pricing.currency);
      }
    }

    const response = await api.post('/facilities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateFacility: async (id: string, data: Partial<CreateFacilityData>): Promise<ApiResponse<Facility>> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location) {
      formData.append('location[address]', data.location.address);
      formData.append('location[city]', data.location.city);
      formData.append('location[state]', data.location.state);
      formData.append('location[zipCode]', data.location.zipCode);
    }
    
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    if (data.amenities) {
      data.amenities.forEach((amenity) => {
        formData.append('amenities[]', amenity);
      });
    }

    // Add pricing data
    if (data.pricing) {
      formData.append('pricing[basePrice]', data.pricing.basePrice.toString());
      if (data.pricing.peakHourPrice) {
        formData.append('pricing[peakHourPrice]', data.pricing.peakHourPrice.toString());
      }
      if (data.pricing.weekendPrice) {
        formData.append('pricing[weekendPrice]', data.pricing.weekendPrice.toString());
      }
      if (data.pricing.currency) {
        formData.append('pricing[currency]', data.pricing.currency);
      }
    }

    const response = await api.put(`/facilities/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


};

// Sport API
export const sportApi = {
  getSports: async (): Promise<ApiResponse<Sport[]>> => {
    const response = await api.get('/sports');
    return response.data;
  },

  getSport: async (id: string): Promise<ApiResponse<Sport>> => {
    const response = await api.get(`/sports/${id}`);
    return response.data;
  },

  getPopularSports: async (limit?: number): Promise<ApiResponse<Sport[]>> => {
    const response = await api.get(`/sports/popular${limit ? `?limit=${limit}` : ''}`);
    return response.data;
  },

  createSport: async (data: Partial<Sport>): Promise<ApiResponse<Sport>> => {
    const response = await api.post('/sports', data);
    return response.data;
  },

  updateSport: async (id: string, data: Partial<Sport>): Promise<ApiResponse<Sport>> => {
    const response = await api.put(`/sports/${id}`, data);
    return response.data;
  },

  deleteSport: async (id: string): Promise<void> => {
    await api.delete(`/sports/${id}`);
  },

  updateSportPopularity: async (id: string, increment: number = 1): Promise<ApiResponse<Sport>> => {
    const response = await api.patch(`/sports/${id}/popularity`, { increment });
    return response.data;
  },
};

// Court API
export const courtApi = {
  getCourts: async (facilityId: string): Promise<ApiResponse<Court[]>> => {
    const response = await api.get(`/facilities/${facilityId}/courts`);
    return response.data;
  },

  getCourt: async (id: string): Promise<ApiResponse<Court>> => {
    const response = await api.get(`/courts/${id}`);
    return response.data;
  },

  createCourt: async (facilityId: string, data: CreateCourtData): Promise<ApiResponse<Court>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('sportType', data.sportType);
    formData.append('surfaceType', data.surfaceType);
    formData.append('pricePerHour', data.pricePerHour.toString());
    
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/facilities/${facilityId}/courts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCourt: async (id: string, data: Partial<CreateCourtData>): Promise<ApiResponse<Court>> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.sportType) formData.append('sportType', data.sportType);
    if (data.surfaceType) formData.append('surfaceType', data.surfaceType);
    if (data.pricePerHour) formData.append('pricePerHour', data.pricePerHour.toString());
    
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.put(`/courts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCourt: async (id: string): Promise<void> => {
    await api.delete(`/courts/${id}`);
  },
};

// Booking API
export const bookingApi = {
  getBookings: async (facilityId?: string): Promise<ApiResponse<Booking[]>> => {
    const params = facilityId ? { facility: facilityId } : {};
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: CreateBookingData): Promise<ApiResponse<Booking>> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string): Promise<ApiResponse<Booking>> => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUserTrends: async (period: string = 'month'): Promise<ApiResponse<any>> => {
    const response = await api.get(`/admin/trends/users?period=${period}`);
    return response.data;
  },

  getBookingTrends: async (period: string = 'week'): Promise<ApiResponse<any>> => {
    const response = await api.get(`/admin/trends/bookings?period=${period}`);
    return response.data;
  },

  getActiveSports: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/sports/active');
    return response.data;
  },

  getRecentUsers: async (limit: number = 10): Promise<ApiResponse<User[]>> => {
    const response = await api.get(`/admin/users/recent?limit=${limit}`);
    return response.data;
  },

  getPendingFacilities: async (): Promise<ApiResponse<Facility[]>> => {
    const response = await api.get('/admin/facilities/pending');
    return response.data;
  },

  approveFacility: async (facilityId: string, action: 'approve' | 'reject'): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/admin/facilities/${facilityId}/approve`, { action });
    return response.data;
  },

  banUser: async (userId: string, action: 'ban' | 'unban'): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/admin/users/${userId}/ban`, { action });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// Owner API
export const ownerApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/owner/stats');
    return response.data;
  },

  getBookingTrends: async (period: string = 'week'): Promise<ApiResponse<any>> => {
    const response = await api.get(`/owner/trends/bookings?period=${period}`);
    return response.data;
  },

  getPeakHours: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/owner/peak-hours');
    return response.data;
  },
};

export default api;
