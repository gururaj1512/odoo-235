export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Owner';
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFacility {
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
  owner: string | IUser;
  isActive: boolean;
  pricing: {
    basePrice: number;
    peakHourPrice?: number;
    weekendPrice?: number;
    currency?: string;
  };
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourt {
  name: string;
  sportType: string;
  sport: string | ISport;
  surfaceType: string;
  pricePerHour: number;
  images: string[];
  isAvailable: boolean;
  facility: string | IFacility;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  user: string | IUser;
  court: string | ICourt;
  facility: string | IFacility;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISport {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  user?: IUser & { _id: string };
  params: any;
  query: any;
  body: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  headers: any;
  cookies: any;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}
