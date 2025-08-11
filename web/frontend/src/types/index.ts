export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'User' | 'Owner' | 'Admin';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
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
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  approvedBy?: User;
  rejectionReason?: string;
  pricing: {
    basePrice: number;
    peakHourPrice?: number;
    weekendPrice?: number;
    currency?: string;
  };
  amenities?: string[];
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
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  cancellationReason?: string;
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
  data: T;
  count?: number;
  error?: string;
  message?: string;
  token?: string;
  user?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Owner' | 'Admin';
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
  amenities: string[];
  pricing: {
    basePrice: number;
    peakHourPrice?: number;
    weekendPrice?: number;
    currency?: string;
  };
  courts?: {
    name: string;
    sportType: string;
    surfaceType: string;
    pricePerHour: number;
  }[];
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
  totalAmount: number;
}

export interface BookingDetails {
  courtId: string;
  courtName: string;
  courtImage: string;
  sportType: string;
  surfaceType: string;
  pricePerHour: number;
  facilityName: string;
  facilityLocation: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  totalAmount: number;
}

export interface Sport {
  _id: string;
  name: string;
  description: string;
  category: 'Indoor' | 'Outdoor' | 'Both';
  playersPerTeam: number;
  maxPlayers: number;
  equipment: string[];
  rules: string[];
  icon: string;
  isActive: boolean;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}
