import mongoose, { Document, Schema } from 'mongoose';
import { ICourt } from '../types';

export interface ICourtDocument extends ICourt, Document {}

const courtSchema = new Schema<ICourtDocument>({
  name: {
    type: String,
    required: [true, 'Please add a court name'],
    trim: true,
    maxlength: [100, 'Court name cannot be more than 100 characters']
  },
  sportType: {
    type: String,
    required: [true, 'Please add a sport type'],
    enum: ['Tennis', 'Basketball', 'Badminton', 'Squash', 'Volleyball', 'Football', 'Cricket', 'Table Tennis', 'Other']
  },
  surfaceType: {
    type: String,
    required: [true, 'Please add a surface type'],
    enum: ['Hard Court', 'Clay', 'Grass', 'Synthetic', 'Wood', 'Carpet', 'Other']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please add a price per hour'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  facility: {
    type: Schema.Types.ObjectId as any,
    ref: 'Facility',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICourtDocument>('Court', courtSchema);
