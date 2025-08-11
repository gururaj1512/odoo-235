import { Request, Response } from 'express';
import Facility from '../models/Facility';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../types';

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
export const getFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport, category, search, sort } = req.query;
    
    let query: any = { isActive: true };
    
    // Filter by sport
    if (sport) {
      query['courts.sport'] = sport;
    }
    
    // Filter by category
    if (category) {
      query['courts.sportType'] = category;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'price') sortOption = { 'courts.pricePerHour': 1 };
    if (sort === 'name') sortOption = { name: 1 };

    const facilities = await Facility.find(query)
      .populate('owner', 'name email')
      .populate({
        path: 'courts',
        populate: {
          path: 'sport',
          select: 'name icon category'
        }
      })
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
export const getFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'courts',
        match: { isAvailable: true }
      });

    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new facility
// @route   POST /api/facilities
// @access  Private (Owner only)
export const createFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, location } = req.body;
    const files = req.files as Express.Multer.File[];

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'facilities',
          width: 1000,
          crop: 'scale'
        });
        imageUrls.push(result.secure_url);
      }
    }

    const facility = await Facility.create({
      name,
      description,
      location,
      images: imageUrls,
      owner: req.user!._id
    });

    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private (Owner only)
export const updateFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let facility = await Facility.findById(req.params.id);

    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    // Make sure user is facility owner
    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this facility'
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const { name, description, location } = req.body;

    // Handle image uploads if new images are provided
    if (files && files.length > 0) {
      const imageUrls: string[] = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'facilities',
          width: 1000,
          crop: 'scale'
        });
        imageUrls.push(result.secure_url);
      }
      
      // Combine existing and new images
      const existingImages = facility.images || [];
      facility.images = [...existingImages, ...imageUrls];
    }

    facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { name, description, location, images: facility.images },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private (Owner only)
export const deleteFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
      return;
    }

    // Make sure user is facility owner
    if (facility.owner.toString() !== req.user!._id.toString()) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to delete this facility'
      });
      return;
    }

    // Soft delete - set isActive to false
    facility.isActive = false;
    await facility.save();

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
