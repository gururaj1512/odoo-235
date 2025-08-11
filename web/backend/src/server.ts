import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

dotenv.config();

import connectDB from './config/database';

import auth from './routes/auth';
import facilities from './routes/facilities';
import courts from './routes/courts';
import bookings from './routes/bookings';
import sports from './routes/sports';
import admin from './routes/admin';

import { notFound, errorHandler } from './middleware/error';

const app = express();

connectDB();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', auth);
app.use('/api/facilities', facilities);
app.use('/api/courts', courts);
app.use('/api/bookings', bookings);
app.use('/api/sports', sports);
app.use('/api/admin', admin);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickCourt API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: any, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
