const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error('Centralized Error Handler:', err.message || err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `A record with this ${key} already exists.`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid format for field ${err.path}`,
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
