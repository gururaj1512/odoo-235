import { Request, Response } from 'express';
import User from '../models/User';
import Facility from '../models/Facility';
import Court from '../models/Court';
import Booking from '../models/Booking';
import { AuthRequest } from '../types';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin (user81@gmail.com)
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access admin stats'
      });
      return;
    }

    // Get total users
    const totalUsers = await User.countDocuments({ role: 'User' });
    const totalOwners = await User.countDocuments({ role: 'Owner' });
    
    // Get total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get total active courts
    const totalActiveCourts = await Court.countDocuments({ isAvailable: true });
    
    // Get pending facilities (facilities that are not active)
    const pendingApprovals = await Facility.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalBookings,
        totalActiveCourts,
        pendingApprovals
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user registration trends
// @route   GET /api/admin/trends/users
// @access  Private (Admin only)
export const getUserTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access user trends'
      });
      return;
    }

    const { period = 'month' } = req.query;
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const users = await User.find({
      createdAt: { $gte: startDate }
    }).select('createdAt role');

    // Group by month/week and role
    const trends = users.reduce((acc: any, user) => {
      const date = new Date(user.createdAt);
      const key = period === 'week' 
        ? `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { users: 0, owners: 0 };
      }
      
      if (user.role === 'Owner') {
        acc[key].owners++;
      } else {
        acc[key].users++;
      }
      
      return acc;
    }, {});

    // Convert to array format
    const trendsArray = Object.entries(trends).map(([period, data]: [string, any]) => ({
      period,
      users: data.users,
      owners: data.owners
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

// @desc    Get booking trends
// @route   GET /api/admin/trends/bookings
// @access  Private (Admin only)
export const getBookingTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access booking trends'
      });
      return;
    }

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

    const bookings = await Booking.find({
      createdAt: { $gte: startDate }
    }).select('createdAt totalAmount');

    // Group by day
    const trends = bookings.reduce((acc: any, booking) => {
      const date = new Date(booking.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { bookings: 0, revenue: 0 };
      }
      
      acc[key].bookings++;
      acc[key].revenue += booking.totalAmount;
      
      return acc;
    }, {});

    // Convert to array format
    const trendsArray = Object.entries(trends).map(([date, data]: [string, any]) => ({
      date,
      bookings: data.bookings,
      revenue: data.revenue
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

// @desc    Get most active sports
// @route   GET /api/admin/sports/active
// @access  Private (Admin only)
export const getActiveSports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access active sports'
      });
      return;
    }

    const bookings = await Booking.find().populate('court');

    // Group by sport type
    const sportsStats = bookings.reduce((acc: any, booking) => {
      // Type assertion for populated court
      const court = booking.court as any;
      const sportType = court?.sportType || 'Unknown';
      
      if (!acc[sportType]) {
        acc[sportType] = { bookings: 0, revenue: 0 };
      }
      
      acc[sportType].bookings++;
      acc[sportType].revenue += booking.totalAmount;
      
      return acc;
    }, {});

    // Convert to array and sort by bookings
    const sportsArray = Object.entries(sportsStats)
      .map(([sport, data]: [string, any]) => ({
        sport,
        bookings: data.bookings,
        revenue: data.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10); // Top 10

    res.status(200).json({
      success: true,
      data: sportsArray
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get recent users
// @route   GET /api/admin/users/recent
// @access  Private (Admin only)
export const getRecentUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access recent users'
      });
      return;
    }

    const { limit = 10 } = req.query;

    const users = await User.find()
      .select('name email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending facilities
// @route   GET /api/admin/facilities/pending
// @access  Private (Admin only)
export const getPendingFacilities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can access pending facilities'
      });
      return;
    }

    const facilities = await Facility.find({ isActive: false })
      .populate('owner', 'name email')
      .populate('courts', 'sportType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: facilities
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve/Reject facility
// @route   PATCH /api/admin/facilities/:id/approve
// @access  Private (Admin only)
export const approveFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can approve/reject facilities'
      });
      return;
    }

    const { action } = req.body; // 'approve' or 'reject'
    const facilityId = req.params.id;

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    if (action === 'approve') {
      facility.isActive = true;
      facility.approvedAt = new Date();
      facility.approvedBy = req.user!._id;
    } else if (action === 'reject') {
      facility.isActive = false;
      facility.rejectedAt = new Date();
      facility.rejectedBy = req.user!._id;
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Use "approve" or "reject"'
      });
      return;
    }

    await facility.save();

    res.status(200).json({
      success: true,
      message: `Facility ${action}d successfully`,
      data: {
        facilityId: facility._id,
        action,
        isActive: facility.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin only)
export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can ban/unban users'
      });
      return;
    }

    const { action } = req.body; // 'ban' or 'unban'
    const userId = req.params.id;

    // Prevent admin from banning themselves
    if (userId === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        error: 'Cannot ban yourself'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    if (action === 'ban') {
      // Soft delete - set isActive to false
      user.isActive = false;
      user.bannedAt = new Date();
      user.bannedBy = req.user!._id;
    } else if (action === 'unban') {
      // Restore user
      user.isActive = true;
      user.bannedAt = undefined;
      user.bannedBy = undefined;
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Use "ban" or "unban"'
      });
      return;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${action}ned successfully`,
      data: {
        userId: user._id,
        action,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.email !== 'user81@gmail.com') {
      res.status(403).json({
        success: false,
        error: 'Only admin can delete users'
      });
      return;
    }

    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete yourself'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if user has any facilities or bookings
    const userFacilities = await Facility.find({ owner: userId });
    const userBookings = await Booking.find({ user: userId });

    if (userFacilities.length > 0 || userBookings.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete user with existing facilities or bookings. Ban the user instead.'
      });
      return;
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        userId: user._id
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
