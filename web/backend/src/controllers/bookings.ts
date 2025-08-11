import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Court from '../models/Court';
import Facility from '../models/Facility';
import { sendBookingConfirmationEmail } from '../config/email';
import { AuthRequest } from '../types';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let query: any = {};

    // If user is not owner, only show their bookings
    if (req.user!.role !== 'Owner') {
      query.user = req.user!._id;
    }

    // If user is owner, filter by facility if provided
    if (req.user!.role === 'Owner' && req.query.facility) {
      query.facility = req.query.facility;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('court', 'name sportType pricePerHour')
      .populate('facility', 'name location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('court', 'name sportType pricePerHour')
      .populate('facility', 'name location');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check if user is authorized to view this booking
    if (req.user!.role !== 'Owner' && booking.user.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User only)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courtId, date, startTime, endTime } = req.body;

    // Check if court exists and is available
    const court = await Court.findById(courtId);
    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    if (!court.isAvailable) {
      res.status(400).json({
        success: false,
        error: 'Court is not available for booking'
      });
      return;
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      court: courtId,
      date: new Date(date),
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBooking) {
      res.status(400).json({
        success: false,
        error: 'This time slot is already booked'
      });
      return;
    }

    // Calculate total hours and amount
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalAmount = totalHours * court.pricePerHour;

    const booking = await Booking.create({
      user: req.user!._id,
      court: courtId,
      facility: court.facility,
      date: new Date(date),
      startTime,
      endTime,
      totalHours,
      totalAmount
    });

    // Populate the booking for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('court', 'name')
      .populate('facility', 'name');

    // Send confirmation email
    await sendBookingConfirmationEmail(req.user!.email, {
      facilityName: (populatedBooking!.facility as any).name,
      courtName: (populatedBooking!.court as any).name,
      date: populatedBooking!.date,
      startTime: populatedBooking!.startTime,
      endTime: populatedBooking!.endTime,
      totalAmount: populatedBooking!.totalAmount
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner only)
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('facility', 'owner')
      .populate('court', 'name')
      .populate('user', 'email');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check if user owns the facility
    const facility = booking.facility as any;
    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
      return;
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('facility', 'owner')
      .populate('user', 'email');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check if user is authorized to cancel this booking
    const facility = booking.facility as any;
    if (req.user!.role !== 'Owner' && booking.user.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
      return;
    }

    // If user is owner, they can cancel any booking in their facility
    if (req.user!.role === 'Owner' && facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
      return;
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
