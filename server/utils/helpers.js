// Pagination helper
const paginate = (page = 1, limit = 10) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    return {
        skip,
        limit: limitNum,
        page: pageNum
    };
};

// Create pagination response
const paginateResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages
        }
    };
};

// Format date for display
const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
};

// Generate time slots for a day (accepts hour numbers or "HH:MM" strings)
const generateTimeSlots = (start = 8, end = 17, intervalMinutes = 30) => {
    const toMinutes = (val) => {
        if (typeof val === 'string') {
            const [h = '0', m = '0'] = val.split(':');
            return parseInt(h) * 60 + parseInt(m);
        }
        return parseInt(val) * 60;
    };

    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    const slots = [];

    for (let m = startMinutes; m < endMinutes; m += intervalMinutes) {
        const hours = Math.floor(m / 60);
        const minutes = m % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeStr);
    }

    return slots;
};

module.exports = {
    paginate,
    paginateResponse,
    formatDate,
    generateTimeSlots
};
