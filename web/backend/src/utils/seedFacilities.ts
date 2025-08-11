import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facility from '../models/Facility';
import Court from '../models/Court';
import User from '../models/User';

dotenv.config();

const sampleFacilities = [
  {
    name: 'Elite Sports Complex',
    description: 'Premium sports facility with state-of-the-art courts and amenities. Perfect for professional training and recreational play.',
    location: {
      address: '123 Sports Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      coordinates: {
        lat: 19.0760,
        lng: 72.8777
      }
    },
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    pricing: {
      basePrice: 800,
      peakHourPrice: 1200,
      weekendPrice: 1000,
      currency: 'INR'
    },
    amenities: ['AC', 'Parking', 'Shower', 'Cafe', 'WiFi', 'Equipment Rental'],
    approvalStatus: 'approved',
    isActive: true
  },
  {
    name: 'Community Sports Center',
    description: 'Family-friendly sports center with multiple courts and activities for all ages.',
    location: {
      address: '456 Community Road',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      coordinates: {
        lat: 28.7041,
        lng: 77.1025
      }
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
    ],
    pricing: {
      basePrice: 600,
      peakHourPrice: 900,
      weekendPrice: 750,
      currency: 'INR'
    },
    amenities: ['Parking', 'Shower', 'Kids Area', 'Snack Bar'],
    approvalStatus: 'approved',
    isActive: true
  },
  {
    name: 'Pro Tennis Academy',
    description: 'Professional tennis academy with clay and hard courts, coaching programs, and tournament facilities.',
    location: {
      address: '789 Tennis Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    pricing: {
      basePrice: 1200,
      peakHourPrice: 1800,
      weekendPrice: 1500,
      currency: 'INR'
    },
    amenities: ['AC', 'Parking', 'Shower', 'Pro Shop', 'Coaching', 'Tournament Hall'],
    approvalStatus: 'approved',
    isActive: true
  },
  {
    name: 'Badminton Hub',
    description: 'Dedicated badminton facility with multiple courts, professional lighting, and coaching services.',
    location: {
      address: '321 Badminton Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      coordinates: {
        lat: 13.0827,
        lng: 80.2707
      }
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
    ],
    pricing: {
      basePrice: 500,
      peakHourPrice: 800,
      weekendPrice: 650,
      currency: 'INR'
    },
    amenities: ['AC', 'Parking', 'Equipment Rental', 'Coaching', 'Tournament Support'],
    approvalStatus: 'approved',
    isActive: true
  },
  {
    name: 'Multi-Sport Arena',
    description: 'Large sports complex featuring basketball, volleyball, and indoor football courts with modern facilities.',
    location: {
      address: '654 Arena Boulevard',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      coordinates: {
        lat: 17.3850,
        lng: 78.4867
      }
    },
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    pricing: {
      basePrice: 700,
      peakHourPrice: 1100,
      weekendPrice: 900,
      currency: 'INR'
    },
    amenities: ['AC', 'Parking', 'Shower', 'Cafeteria', 'Equipment Rental', 'Locker Rooms'],
    approvalStatus: 'approved',
    isActive: true
  }
];

const sampleCourts = [
  // Elite Sports Complex courts
  {
    name: 'Court 1 - Tennis',
    sportType: 'Tennis',
    surfaceType: 'Hard Court',
    pricePerHour: 800,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  {
    name: 'Court 2 - Badminton',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    pricePerHour: 600,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  // Community Sports Center courts
  {
    name: 'Court A - Basketball',
    sportType: 'Basketball',
    surfaceType: 'Hard Court',
    pricePerHour: 500,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  {
    name: 'Court B - Volleyball',
    sportType: 'Volleyball',
    surfaceType: 'Synthetic',
    pricePerHour: 400,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  // Pro Tennis Academy courts
  {
    name: 'Clay Court 1',
    sportType: 'Tennis',
    surfaceType: 'Clay',
    pricePerHour: 1200,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  {
    name: 'Hard Court 1',
    sportType: 'Tennis',
    surfaceType: 'Hard Court',
    pricePerHour: 1000,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  // Badminton Hub courts
  {
    name: 'Badminton Court 1',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    pricePerHour: 500,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  {
    name: 'Badminton Court 2',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    pricePerHour: 500,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  // Multi-Sport Arena courts
  {
    name: 'Basketball Court',
    sportType: 'Basketball',
    surfaceType: 'Hard Court',
    pricePerHour: 700,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
    isAvailable: true
  },
  {
    name: 'Football Court',
    sportType: 'Football',
    surfaceType: 'Synthetic',
    pricePerHour: 800,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    isAvailable: true
  }
];

const seedFacilities = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Facility.deleteMany({});
    await Court.deleteMany({});
    console.log('Cleared existing facilities and courts');

    // Create a sample owner user if it doesn't exist
    let owner = await User.findOne({ email: 'owner@quickcourt.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Facility Owner',
        email: 'owner@quickcourt.com',
        password: 'password123',
        role: 'Owner',
        isEmailVerified: true
      });
      console.log('Created sample owner user');
    }

    // Create facilities
    const createdFacilities = [];
    for (let i = 0; i < sampleFacilities.length; i++) {
      const facilityData = {
        ...sampleFacilities[i],
        owner: owner._id
      };
      
      const facility = await Facility.create(facilityData);
      createdFacilities.push(facility);
      console.log(`Created facility: ${facility.name}`);
    }

    // Create courts for each facility
    const courtsPerFacility = 2;
    for (let i = 0; i < createdFacilities.length; i++) {
      const facility = createdFacilities[i];
      const startIndex = i * courtsPerFacility;
      
      for (let j = 0; j < courtsPerFacility; j++) {
        const courtData = {
          ...sampleCourts[startIndex + j],
          facility: facility._id
        };
        
        const court = await Court.create(courtData);
        console.log(`Created court: ${court.name} for ${facility.name}`);
      }
    }

    console.log('✅ Sample facilities and courts seeded successfully!');
    console.log(`Created ${createdFacilities.length} facilities with ${createdFacilities.length * courtsPerFacility} courts`);

  } catch (error) {
    console.error('Error seeding facilities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedFacilities();
