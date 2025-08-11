export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'User' | 'Owner';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  owner: User;
  isActive: boolean;
  courts?: Court[];
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  _id: string;
  name: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
  images: string[];
  isAvailable: boolean;
  facility: string | Facility;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  user: User;
  court: Court;
  facility: Facility;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Owner';
}

export interface CreateFacilityData {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images: File[];
}

export interface CreateCourtData {
  name: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
  images: File[];
}

export interface CreateBookingData {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
}
