// Simplified rate limiter - disabled for development
const apiLimiter = (req, res, next) => next();
const authLimiter = (req, res, next) => next();

module.exports = { apiLimiter, authLimiter };
