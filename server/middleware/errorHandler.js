// 404 handler
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
};

// Centralized error handler
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Co loi he thong, vui long thu lai';

    console.error(`[${new Date().toISOString()}] Error ${req.method} ${req.originalUrl}:`, message, err.stack || '');

    res.status(status).json({
        success: false,
        error: message
    });
};

module.exports = {
    notFound,
    errorHandler
};
