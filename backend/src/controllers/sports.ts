import { Request, Response } from 'express';
import Sport from '../models/Sport';

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
export const getSports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive, search } = req.query;
    
    let query: any = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const sports = await Sport.find(query)
      .sort({ popularity: -1, name: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: sports.length,
      data: sports
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single sport
// @route   GET /api/sports/:id
// @access  Public
export const getSport = async (req: Request, res: Response): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id).select('-__v');

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sport
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new sport
// @route   POST /api/sports
// @access  Private (Admin/Owner)
export const createSport = async (req: Request, res: Response): Promise<void> => {
  try {
    const sport = await Sport.create(req.body);

    res.status(201).json({
      success: true,
      data: sport
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Sport with this name already exists'
      });
      return;
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update sport
// @route   PUT /api/sports/:id
// @access  Private (Admin/Owner)
export const updateSport = async (req: Request, res: Response): Promise<void> => {
  try {
    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sport
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Sport with this name already exists'
      });
      return;
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete sport
// @route   DELETE /api/sports/:id
// @access  Private (Admin/Owner)
export const deleteSport = async (req: Request, res: Response): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    await sport.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get popular sports
// @route   GET /api/sports/popular
// @access  Public
export const getPopularSports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const sports = await Sport.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(Number(limit))
      .select('name icon category popularity');

    res.status(200).json({
      success: true,
      count: sports.length,
      data: sports
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update sport popularity
// @route   PATCH /api/sports/:id/popularity
// @access  Public
export const updateSportPopularity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { increment = 1 } = req.body;
    
    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      { $inc: { popularity: Number(increment) } },
      { new: true }
    ).select('-__v');

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sport
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
