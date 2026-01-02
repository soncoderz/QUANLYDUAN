const { protect, authorize } = require('./auth');
const { validate, schemas } = require('./validation');
const { apiLimiter, authLimiter } = require('./rateLimit');
const { requestLogger } = require('./logger');
const { basicSecurity, detectMaliciousPayload } = require('./security');
const { errorHandler, notFound } = require('./errorHandler');

module.exports = {
    protect,
    authorize,
    validate,
    schemas,
    apiLimiter,
    authLimiter,
    requestLogger,
    basicSecurity,
    detectMaliciousPayload,
    errorHandler,
    notFound
};
