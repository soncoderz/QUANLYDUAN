// Basic security hardening: add common headers and block obvious NoSQL injection patterns
const basicSecurity = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    next();
};

// Recursively check for keys that look like NoSQL operators
const hasSuspiciousKeys = (payload, visited = new Set()) => {
    if (!payload || typeof payload !== 'object') return false;
    if (visited.has(payload)) return false;
    visited.add(payload);

    return Object.keys(payload).some((key) => {
        if (key.startsWith('$') || key.includes('__proto__')) {
            return true;
        }

        const value = payload[key];
        if (Array.isArray(value)) {
            return value.some((item) => hasSuspiciousKeys(item, visited));
        }

        if (typeof value === 'object') {
            return hasSuspiciousKeys(value, visited);
        }

        return false;
    });
};

const detectMaliciousPayload = (req, res, next) => {
    const sources = ['body', 'query', 'params'];
    for (const source of sources) {
        if (hasSuspiciousKeys(req[source])) {
            return res.status(400).json({
                success: false,
                error: 'Yeu cau khong hop le'
            });
        }
    }
    next();
};

module.exports = {
    basicSecurity,
    detectMaliciousPayload
};
