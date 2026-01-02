// Simple request/response logger for auditability
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const userLabel = req.user ? `${req.user.role}:${req.user._id}` : 'guest';
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${userLabel}`);
    });
    next();
};

module.exports = {
    requestLogger
};
