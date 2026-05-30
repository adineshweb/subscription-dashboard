const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error('Centralized Error Handler:', err.message || err);

  // Safe Zod Validation Error handler
  if (err instanceof ZodError || err.name === 'ZodError' || err.constructor?.name === 'ZodError') {
    const issues = err.errors || err.issues || [];
    return res.status(400).json({
      message: 'Validation failed',
      errors: issues.map(e => ({
        path: Array.isArray(e.path) ? e.path.join('.') : (e.path || ''),
        message: e.message,
      })),
    });
  }

  // Mongoose Validation Error handler
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map(e => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose Duplicate Key Error handler
  if (err.code === 11000) {
    const key = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    return res.status(400).json({
      message: `A record with this ${key} already exists.`,
    });
  }

  // Mongoose Cast Error handler
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid format for field ${err.path}`,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid authorization session.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
