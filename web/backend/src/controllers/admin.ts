import { Request, Response } from 'express';
import Facility from '../models/Facility';
import User, { IUserDocument } from '../models/User';
import Booking from '../models/Booking';
import Court from '../models/Court';
import { AuthRequest } from '../types';

// @desc    Get global statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getGlobalStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'User' });
    const totalOwners = await User.countDocuments({ role: 'Owner' });
    const totalBookings = await Booking.countDocuments();
    const totalActiveCourts = await Court.countDocuments({ isAvailable: true });
    const pendingFacilities = await Facility.countDocuments({ approvalStatus: 'pending' });

    // Calculate total earnings (sum of all booking amounts)
    const earningsResult = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    // Get recent activity
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('facility', 'name')
      .sort('-createdAt')
      .limit(10);

    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOwners,
          totalBookings,
          totalActiveCourts,
          totalEarnings,
          pendingFacilities
        },
        recentBookings,
        recentUsers
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending facilities for approval
// @route   GET /api/admin/facilities/pending
// @access  Private (Admin only)
export const getPendingFacilities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pendingFacilities = await Facility.find({ approvalStatus: 'pending' })
      .populate('owner', 'name email')
      .populate('courts')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const totalPending = await Facility.countDocuments({ approvalStatus: 'pending' });

    res.status(200).json({
      success: true,
      count: pendingFacilities.length,
      totalCount: totalPending,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPending / limitNum),
        hasNextPage: pageNum < Math.ceil(totalPending / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum
      },
      data: pendingFacilities
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve or reject facility
// @route   PUT /api/admin/facilities/:id/approval
// @access  Private (Admin only)
export const updateFacilityApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    const facilityId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be either "approved" or "rejected"'
      });
      return;
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    // Update facility approval status
    facility.approvalStatus = status;
    facility.approvalDate = new Date();
    facility.approvedBy = req.user!._id;

    if (status === 'rejected' && rejectionReason) {
      facility.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      facility.isActive = true;
    }

    await facility.save();

    // Populate the updated facility
    const updatedFacility = await Facility.findById(facilityId)
      .populate('owner', 'name email')
      .populate('approvedBy', 'name email')
      .populate('courts');

    res.status(200).json({
      success: true,
      data: updatedFacility
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    // Filter by role
    if (role && ['User', 'Owner', 'Admin'].includes(role as string)) {
      query.role = role;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      totalCount: totalUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        hasNextPage: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum
      },
      data: users
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Ban or unban user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!['active', 'banned'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be either "active" or "banned"'
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

    const userDoc = user as IUserDocument & { _id: string };

    // Prevent admin from banning themselves
    if (userDoc._id.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        error: 'Cannot ban yourself'
      });
      return;
    }

    userDoc.isActive = status === 'active';
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify or unverify user
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isVerified, verificationReason } = req.body;
    const userId = req.params.id;

    if (typeof isVerified !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'isVerified must be a boolean value'
      });
      return;
    }

    const user = await User.findById(userId) as IUserDocument | null;
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    user.isVerified = isVerified;
    if (verificationReason) {
      user.verificationReason = verificationReason;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const userDoc = user as IUserDocument & { _id: string };

    // Prevent admin from changing their own role
    if (userDoc._id.toString() === req.user!._id.toString() && role && role !== userDoc.role) {
      res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
      return;
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role && ['User', 'Owner', 'Admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const userDoc = user as IUserDocument & { _id: string };

    // Prevent admin from deleting themselves
    if (userDoc._id.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete yourself'
      });
      return;
    }

    // Delete user's facilities if they are an owner
    if (user.role === 'Owner') {
      await Facility.deleteMany({ owner: userId });
    }

    // Delete user's bookings
    await Booking.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get booking analytics
// @route   GET /api/admin/analytics/bookings
// @access  Private (Admin only)
export const getBookingAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'week' } = req.query;

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

    // Get booking trends
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: dateFilter
        }
      },
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
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get sport-wise analytics
    const sportAnalytics = await Booking.aggregate([
      {
        $match: {
          createdAt: dateFilter
        }
      },
      {
        $lookup: {
          from: 'courts',
          localField: 'court',
          foreignField: '_id',
          as: 'courtData'
        }
      },
      {
        $unwind: '$courtData'
      },
      {
        $group: {
          _id: '$courtData.sportType',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { bookings: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingTrends,
        sportAnalytics
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
