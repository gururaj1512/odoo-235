import mongoose, { Document, Schema } from 'mongoose';
import { IBooking } from '../types';

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>({
  user: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true
  },
  court: {
    type: Schema.Types.ObjectId as any,
    ref: 'Court',
    required: true
  },
  facility: {
    type: Schema.Types.ObjectId as any,
    ref: 'Facility',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  totalHours: {
    type: Number,
    required: [true, 'Please add total hours']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate total hours
bookingSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    this.totalHours = Math.abs(diffInHours);
  }
  next();
});

export default mongoose.model<IBookingDocument>('Booking', bookingSchema);
