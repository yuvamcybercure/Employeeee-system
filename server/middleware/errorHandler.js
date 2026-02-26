// Fix #3: Centralized Error Handler Middleware
// Masks internal error details in production. Logs full stack server-side.

const logger = require('../config/logger');

const errorHandler = (err, req, res, _next) => {
    // Log the full error server-side
    logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
        stack: err.stack,
        ip: req.ip,
        userId: req.user?._id,
    });

    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        success: false,
        message: isProduction && statusCode === 500
            ? 'An internal server error occurred'
            : err.message || 'An internal server error occurred',
    });
};

module.exports = errorHandler;
