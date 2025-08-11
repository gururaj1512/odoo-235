import mongoose, { Document, Schema } from 'mongoose';
import { ISport } from '../types';

export interface ISportDocument extends ISport, Document {}

const sportSchema = new Schema<ISportDocument>({
  name: {
    type: String,
    required: [true, 'Please add a sport name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Sport name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Indoor', 'Outdoor', 'Both'],
    default: 'Outdoor'
  },
  playersPerTeam: {
    type: Number,
    required: [true, 'Please specify number of players per team'],
    min: [1, 'Players per team must be at least 1']
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Please specify maximum number of players'],
    min: [1, 'Maximum players must be at least 1']
  },
  equipment: [{
    type: String,
    trim: true
  }],
  rules: [{
    type: String,
    trim: true
  }],
  icon: {
    type: String,
    default: 'sports-soccer' // Default icon
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0,
    min: [0, 'Popularity cannot be negative']
  }
}, {
  timestamps: true
});

// Create index for better search performance
sportSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<ISportDocument>('Sport', sportSchema);
