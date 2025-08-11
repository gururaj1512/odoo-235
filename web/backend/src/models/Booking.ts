import mongoose, { Document, Schema } from 'mongoose';
import { IBooking } from '../types';

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  court: {
    type: Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  facility: {
    type: Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time format (HH:MM)']
  },
  totalHours: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Calculate total hours and amount before saving
bookingSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    this.totalHours = diffMs / (1000 * 60 * 60);
  }
  next();
});

export default mongoose.model<IBookingDocument>('Booking', bookingSchema);
