import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  facility: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>({
  facility: {
    type: Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Please provide a review'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Ensure one rating per user per facility
ratingSchema.index({ facility: 1, user: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', ratingSchema);
