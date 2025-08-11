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
      .populate('court', 'name sportType pricePerHour surfaceType')
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
    const { courtId, facilityId, date, startTime, endTime, totalAmount } = req.body;
    
    console.log('Creating booking with data:', {
      courtId,
      facilityId,
      date,
      startTime,
      endTime,
      totalAmount,
      userId: req.user!._id
    });

    // Validate required fields
    if (!date || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: date, startTime, endTime'
      });
      return;
    }

    // Either courtId or facilityId must be provided
    if (!courtId && !facilityId) {
      res.status(400).json({
        success: false,
        error: 'Either courtId or facilityId must be provided'
      });
      return;
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      res.status(400).json({
        success: false,
        error: 'Cannot book for past dates'
      });
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      res.status(400).json({
        success: false,
        error: 'Invalid time format. Use HH:MM format'
      });
      return;
    }

    // Validate start time is before end time
    if (startTime >= endTime) {
      res.status(400).json({
        success: false,
        error: 'Start time must be before end time'
      });
      return;
    }

    let court: any = null;
    let facility: any = null;

    if (courtId) {
      // Court-specific booking
      court = await Court.findById(courtId);
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

      facility = await Facility.findById(court.facility);
      if (!facility) {
        res.status(404).json({
          success: false,
          error: 'Facility not found for this court'
        });
        return;
      }
    } else if (facilityId) {
      // Facility-level booking - find an available court
      facility = await Facility.findById(facilityId);
      if (!facility) {
        res.status(404).json({
          success: false,
          error: 'Facility not found'
        });
        return;
      }

      // Find an available court in the facility
      court = await Court.findOne({
        facility: facilityId,
        isAvailable: true
      });

      if (!court) {
        res.status(400).json({
          success: false,
          error: 'No available courts found in this facility for the selected time'
        });
        return;
      }
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      court: court._id,
      date: new Date(date),
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $gte: startTime, $lt: endTime }
        },
        {
          endTime: { $gt: startTime, $lte: endTime }
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

    // Calculate total hours
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Use the totalAmount from frontend or calculate if not provided
    const finalTotalAmount = totalAmount || (totalHours * court.pricePerHour);

    const booking = await Booking.create({
      user: req.user!._id,
      court: court._id,
      facility: facility._id,
      date: new Date(date),
      startTime,
      endTime,
      totalHours,
      totalAmount: finalTotalAmount
    });

    // Populate the booking for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('court', 'name')
      .populate('facility', 'name');

    // Send confirmation email (don't fail booking if email fails)
    try {
      await sendBookingConfirmationEmail(req.user!.email, {
        facilityName: (populatedBooking!.facility as any).name,
        courtName: (populatedBooking!.court as any).name,
        date: populatedBooking!.date,
        startTime: populatedBooking!.startTime,
        endTime: populatedBooking!.endTime,
        totalAmount: populatedBooking!.totalAmount
      });
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking creation if email fails
    }

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

// @desc    Update booking status (for owners)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner only)
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, reason } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('facility', 'owner')
      .populate('user', 'name email');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check if the user owns the facility
    if ((booking.facility as any).owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
      return;
    }

    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
      return;
    }

    // Update booking status
    booking.status = status;
    if (reason) {
      booking.cancellationReason = reason;
    }

    await booking.save();

    // Send email notification to user
    try {
      if (status === 'Confirmed') {
        await sendBookingConfirmationEmail((booking.user as any).email, booking);
      } else if (status === 'Cancelled') {
        // Assuming sendBookingCancellationEmail is defined elsewhere or will be added.
        // For now, we'll just log the error if it's cancelled.
        console.error('sendBookingCancellationEmail is not defined yet.');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
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

// @desc    Get bookings for owner's facilities
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, facilityId, date } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get owner's facilities
    const ownerFacilities = await Facility.find({ owner: req.user!._id });
    const facilityIds = ownerFacilities.map(f => f._id);

    let query: any = {
      facility: { $in: facilityIds }
    };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by specific facility
    if (facilityId) {
      query.facility = facilityId;
    }

    // Filter by date
    if (date) {
      const filterDate = new Date(date as string);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: filterDate,
        $lt: nextDay
      };
    }

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('facility', 'name location')
      .populate('court', 'name sportType')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    // Calculate pagination info
    const totalPages = Math.ceil(totalBookings / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Calculate summary statistics
    const totalEarnings = await Booking.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const statusCounts = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalCount: totalBookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      summary: {
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as any)
      },
      data: bookings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get booking analytics for owner
// @route   GET /api/bookings/owner/analytics
// @access  Private (Owner only)
export const getOwnerBookingAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'week', facilityId } = req.query;

    // Get owner's facilities
    const ownerFacilities = await Facility.find({ owner: req.user!._id });
    const facilityIds = ownerFacilities.map(f => f._id);

    let dateFilter: any = {};
    const now = new Date();

    // Set date range based on period
    switch (period) {
      case 'week':
        dateFilter = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        };
        break;
      case 'year':
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1)
        };
        break;
    }

    let matchQuery: any = {
      facility: { $in: facilityIds },
      createdAt: dateFilter
    };

    if (facilityId) {
      matchQuery.facility = facilityId;
    }

    // Get booking trends
    const bookingTrends = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'week' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get facility-wise analytics
    const facilityAnalytics = await Booking.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'facilities',
          localField: 'facility',
          foreignField: '_id',
          as: 'facilityData'
        }
      },
      { $unwind: '$facilityData' },
      {
        $group: {
          _id: '$facility',
          facilityName: { $first: '$facilityData.name' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get sport-wise analytics
    const sportAnalytics = await Booking.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'courts',
          localField: 'court',
          foreignField: '_id',
          as: 'courtData'
        }
      },
      { $unwind: '$courtData' },
      {
        $group: {
          _id: '$courtData.sportType',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookings: -1 } }
    ]);

    // Get status distribution
    const statusDistribution = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingTrends,
        facilityAnalytics,
        sportAnalytics,
        statusDistribution
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
