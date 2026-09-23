import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}'. Must be unique.`;
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for resource lookup: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  const responsePayload = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  return res.status(statusCode).json(responsePayload);
};
