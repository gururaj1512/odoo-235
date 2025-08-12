import { Request, Response } from 'express';
import Rating from '../models/Rating';
import Facility from '../models/Facility';
import { AuthRequest } from '../types';

// @desc    Add or update a rating for a facility
// @route   POST /api/ratings
// @access  Private
export const addRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { facilityId, rating, review } = req.body;
    const userId = req.user!._id;

    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    // Check if user has already rated this facility
    const existingRating = await Rating.findOne({ facility: facilityId, user: userId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      // Create new rating
      await Rating.create({
        facility: facilityId,
        user: userId,
        rating,
        review
      });
    }

    // Get updated facility with ratings and calculate new average
    const updatedFacility = await Facility.findById(facilityId)
      .populate('ratings')
      .populate('owner', 'name email');

    // Calculate new average rating
    const avgRating = await Rating.aggregate([
      { $match: { facility: facilityId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = avgRating.length > 0 ? Math.round(avgRating[0].averageRating * 10) / 10 : 0;
    const totalRatings = await Rating.countDocuments({ facility: facilityId });

    res.status(200).json({
      success: true,
      data: {
        facility: updatedFacility,
        averageRating,
        totalRatings
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get ratings for a facility
// @route   GET /api/ratings/facility/:facilityId
// @access  Public
export const getFacilityRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facilityId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    // Get ratings with pagination
    const ratings = await Rating.find({ facility: facilityId })
      .populate('user', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const totalRatings = await Rating.countDocuments({ facility: facilityId });

    // Calculate average rating
    const avgRating = await Rating.aggregate([
      { $match: { facility: facilityId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = avgRating.length > 0 ? Math.round(avgRating[0].averageRating * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        ratings,
        averageRating,
        totalRatings,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalRatings / limitNum),
          hasNextPage: pageNum < Math.ceil(totalRatings / limitNum),
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const rating = await Rating.findById(id);
    if (!rating) {
      res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
      return;
    }

    // Check if user owns the rating
    if (rating.user.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this rating'
      });
      return;
    }

    const facilityId = rating.facility;
    await Rating.findByIdAndDelete(id);

    // Calculate new average rating after deletion
    const avgRating = await Rating.aggregate([
      { $match: { facility: facilityId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = avgRating.length > 0 ? Math.round(avgRating[0].averageRating * 10) / 10 : 0;
    const totalRatings = await Rating.countDocuments({ facility: facilityId });

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: {
        averageRating,
        totalRatings
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
