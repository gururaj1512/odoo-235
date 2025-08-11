import { Request, Response } from 'express';
import Facility from '../models/Facility';
import Court from '../models/Court';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../types';
import fs from 'fs';
import path from 'path';

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
export const getFacilities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      sport, 
      category, 
      search, 
      sort, 
      page = 1, 
      limit = 12,
      minPrice,
      maxPrice,
      amenities,
      radius,
      timeSlot
    } = req.query;
    
    let query: any = { isActive: true };
    
    // Only show approved facilities to regular users
    // Admins can see all facilities including pending ones
    if (!req.user || req.user.role !== 'Admin') {
      query.approvalStatus = 'approved';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
    }

    // Amenities filtering
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $in: amenitiesArray };
    }
    
    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'price') sortOption = { 'pricing.basePrice': 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'distance') sortOption = { 'location.city': 1 }; // Simple distance sort by city

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'courts',
          localField: '_id',
          foreignField: 'facility',
          as: 'courts'
        }
      }
    ];

    // Filter by sport if specified
    if (sport && sport !== 'all') {
      pipeline.push({
        $match: {
          'courts.sportType': sport
        }
      });
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      pipeline.push({
        $match: {
          'courts.sportType': category
        }
      });
    }

    // Add sorting
    pipeline.push({ $sort: sortOption });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Facility.aggregate(countPipeline);
    const totalFacilities = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Add population for owner
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
      }
    });
    pipeline.push({
      $unwind: '$owner'
    });
    pipeline.push({
      $project: {
        'owner.password': 0,
        'owner.resetPasswordToken': 0,
        'owner.resetPasswordExpire': 0
      }
    });

    const facilities = await Facility.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(totalFacilities / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: facilities.length,
      totalCount: totalFacilities,
      pagination: {
        currentPage: pageNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
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
    const { name, description, location, pricing, amenities, courts } = req.body;
    const files = req.files as Express.Multer.File[];
    
    console.log('Files received:', files?.length || 0);
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          console.log('Uploading to Cloudinary:', file.path);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'facilities',
            width: 1000,
            crop: 'scale'
          });
          console.log('Cloudinary upload successful:', result.secure_url);
          imageUrls.push(result.secure_url);
          
          // Clean up uploaded file after Cloudinary upload
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // Clean up file even if upload fails
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
          throw uploadError;
        }
      }
    }

    // Parse amenities if provided as string
    let amenitiesArray: string[] = [];
    if (amenities) {
      if (typeof amenities === 'string') {
        amenitiesArray = amenities.split(',').map(item => item.trim());
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    // Use default image if no images uploaded
    const finalImages = imageUrls.length > 0 ? imageUrls : [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
    ];

    // Create the facility
    const facility = await Facility.create({
      name,
      description,
      location,
      images: finalImages,
      pricing: {
        basePrice: pricing?.basePrice || 0,
        peakHourPrice: pricing?.peakHourPrice || 0,
        weekendPrice: pricing?.weekendPrice || 0,
        currency: pricing?.currency || 'INR'
      },
      amenities: amenitiesArray,
      owner: req.user!._id
    });

    // Create courts if provided
    if (courts && Array.isArray(courts) && courts.length > 0) {
      const createdCourts = [];
      
      for (const courtData of courts) {
        const court = await Court.create({
          name: courtData.name,
          sportType: courtData.sportType,
          surfaceType: courtData.surfaceType,
          pricePerHour: courtData.pricePerHour,
          images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'],
          facility: facility._id,
          isAvailable: true
        });

        createdCourts.push(court);
      }

      console.log(`Created ${createdCourts.length} courts for facility ${facility._id}`);
    }

    // Populate the facility with courts for response
    const populatedFacility = await Facility.findById(facility._id)
      .populate('courts')
      .populate('owner', 'name email');

    res.status(201).json({
      success: true,
      data: populatedFacility
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
    const { name, description, location, pricing, amenities } = req.body;

    // Handle image uploads if new images are provided
    if (files && files.length > 0) {
      const imageUrls: string[] = [];
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'facilities',
            width: 1000,
            crop: 'scale'
          });
          imageUrls.push(result.secure_url);
          
          // Clean up uploaded file after Cloudinary upload
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // Clean up file even if upload fails
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
          throw uploadError;
        }
      }
      
      // Combine existing and new images
      const existingImages = facility.images || [];
      facility.images = [...existingImages, ...imageUrls];
    }

    // Parse amenities if provided
    let amenitiesArray: string[] = [];
    if (amenities) {
      if (typeof amenities === 'string') {
        amenitiesArray = amenities.split(',').map(item => item.trim());
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    // Prepare update data
    const updateData: any = { name, description, location, images: facility.images };
    
    if (pricing) {
      updateData.pricing = {
        basePrice: pricing.basePrice || facility.pricing?.basePrice || 0,
        peakHourPrice: pricing.peakHourPrice || facility.pricing?.peakHourPrice || 0,
        weekendPrice: pricing.weekendPrice || facility.pricing?.weekendPrice || 0,
        currency: pricing.currency || facility.pricing?.currency || 'INR'
      };
    }
    
    if (amenitiesArray.length > 0) {
      updateData.amenities = amenitiesArray;
    }

    facility = await Facility.findByIdAndUpdate(
      req.params.id,
      updateData,
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
