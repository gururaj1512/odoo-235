import { Request, Response } from 'express';
import Court from '../models/Court';
import Facility from '../models/Facility';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../types';

// @desc    Get all courts for a facility
// @route   GET /api/facilities/:facilityId/courts
// @access  Public
export const getCourts = async (req: Request, res: Response): Promise<void> => {
  try {
    const courts = await Court.find({ 
      facility: req.params.facilityId,
      isAvailable: true 
    }).populate('facility', 'name');

    res.status(200).json({
      success: true,
      count: courts.length,
      data: courts
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single court
// @route   GET /api/courts/:id
// @access  Public
export const getCourt = async (req: Request, res: Response): Promise<void> => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('facility', 'name location');

    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new court
// @route   POST /api/facilities/:facilityId/courts
// @access  Private (Owner only)
export const createCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sportType, surfaceType, pricePerHour } = req.body;
    const facilityId = req.params.facilityId;
    const files = req.files as Express.Multer.File[];

    // Check if facility exists and user owns it
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to add courts to this facility'
      });
      return;
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'courts',
          width: 1000,
          crop: 'scale'
        });
        imageUrls.push(result.secure_url);
      }
    }

    const court = await Court.create({
      name,
      sportType,
      surfaceType,
      pricePerHour,
      images: imageUrls,
      facility: facilityId
    });

    res.status(201).json({
      success: true,
      data: court
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private (Owner only)
export const updateCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let court = await Court.findById(req.params.id).populate('facility');

    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    // Check if user owns the facility
    const facility = court.facility as any;
    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this court'
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const { name, sportType, surfaceType, pricePerHour, isAvailable } = req.body;

    // Handle image uploads if new images are provided
    if (files && files.length > 0) {
      const imageUrls: string[] = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'courts',
          width: 1000,
          crop: 'scale'
        });
        imageUrls.push(result.secure_url);
      }
      
      // Combine existing and new images
      const existingImages = court.images || [];
      court.images = [...existingImages, ...imageUrls];
    }

    court = await Court.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        sportType, 
        surfaceType, 
        pricePerHour, 
        isAvailable,
        images: court.images 
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete court
// @route   DELETE /api/courts/:id
// @access  Private (Owner only)
export const deleteCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const court = await Court.findById(req.params.id).populate('facility');

    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    // Check if user owns the facility
    const facility = court.facility as any;
    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to delete this court'
      });
      return;
    }

    await court.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
