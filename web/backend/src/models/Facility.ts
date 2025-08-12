import mongoose, { Document, Schema } from 'mongoose';
import { IFacility } from '../types';

export interface IFacilityDocument extends IFacility, Document {
  averageRating?: number;
  totalReviews?: number;
}

const facilitySchema = new Schema<IFacilityDocument>({
  name: {
    type: String,
    required: [true, 'Please add a facility name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  owner: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price per hour'],
      min: [0, 'Price cannot be negative']
    },
    peakHourPrice: {
      type: Number,
      default: 0,
      min: [0, 'Peak hour price cannot be negative']
    },
    weekendPrice: {
      type: Number,
      default: 0,
      min: [0, 'Weekend price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for courts
facilitySchema.virtual('courts', {
  ref: 'Court',
  localField: '_id',
  foreignField: 'facility',
  justOne: false
});

// Virtual for ratings
facilitySchema.virtual('ratings', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'facility',
  justOne: false
});

// Virtual for average rating
facilitySchema.virtual('averageRating').get(function(this: any) {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const totalRating = this.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0);
  return Math.round((totalRating / this.ratings.length) * 10) / 10; // Round to 1 decimal place
});

// Virtual for total reviews count
facilitySchema.virtual('totalReviews').get(function(this: any) {
  return this.ratings ? this.ratings.length : 0;
});

export default mongoose.model<IFacilityDocument>('Facility', facilitySchema);
