import { Request, Response } from 'express';
import Facility from '../models/Facility';
import Court from '../models/Court';
import Booking from '../models/Booking';
import { AuthRequest } from '../types';

// @desc    Get owner dashboard stats
// @route   GET /api/owner/stats
// @access  Private (Owner only)
export const getOwnerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get owner's facilities
    const facilities = await Facility.find({ owner: req.user!._id });
    const facilityIds = facilities.map(f => f._id);

    // Get owner's courts
    const courts = await Court.find({ facility: { $in: facilityIds } });
    
    // Get owner's bookings
    const bookings = await Booking.find({ facility: { $in: facilityIds } });

    // Calculate stats
    const totalBookings = bookings.length;
    const activeCourts = courts.filter(court => court.isAvailable).length;
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeCourts,
        totalEarnings,
        pendingBookings,
        totalFacilities: facilities.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get owner's booking trends
// @route   GET /api/owner/trends/bookings
// @access  Private (Owner only)
export const getOwnerBookingTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get owner's facilities
    const facilities = await Facility.find({ owner: req.user!._id });
    const facilityIds = facilities.map(f => f._id);

    const bookings = await Booking.find({
      facility: { $in: facilityIds },
      createdAt: { $gte: startDate }
    }).select('createdAt totalAmount');

    // Group by day
    const trends = bookings.reduce((acc: any, booking) => {
      const date = new Date(booking.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { bookings: 0, earnings: 0 };
      }
      
      acc[key].bookings++;
      acc[key].earnings += booking.totalAmount;
      
      return acc;
    }, {});

    // Convert to array format
    const trendsArray = Object.entries(trends).map(([date, data]: [string, any]) => ({
      date,
      bookings: data.bookings,
      earnings: data.earnings
    }));

    res.status(200).json({
      success: true,
      data: trendsArray
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get owner's peak hours
// @route   GET /api/owner/peak-hours
// @access  Private (Owner only)
export const getOwnerPeakHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get owner's facilities
    const facilities = await Facility.find({ owner: req.user!._id });
    const facilityIds = facilities.map(f => f._id);

    const bookings = await Booking.find({ facility: { $in: facilityIds } })
      .select('startTime');

    // Group by hour
    const hourStats = bookings.reduce((acc: any, booking) => {
      const hour = new Date(`2000-01-01T${booking.startTime}`).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!acc[hourKey]) {
        acc[hourKey] = 0;
      }
      
      acc[hourKey]++;
      return acc;
    }, {});

    // Convert to array and sort by hour
    const peakHours = Object.entries(hourStats)
      .map(([hour, bookings]: [string, any]) => ({
        hour: new Date(`2000-01-01T${hour}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        }),
        bookings
      }))
      .sort((a, b) => {
        const hourA = new Date(`2000-01-01T${a.hour}`).getHours();
        const hourB = new Date(`2000-01-01T${b.hour}`).getHours();
        return hourA - hourB;
      });

    res.status(200).json({
      success: true,
      data: peakHours
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
