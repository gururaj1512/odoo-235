import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email';


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User'
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);

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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'There is no user with that email'
      });
      return;
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({
      success: true,
      message: 'Email sent'
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Email could not be sent'
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', token, options);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};
