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

// Generate time slots for a day
const generateTimeSlots = (startHour = 8, endHour = 17, intervalMinutes = 30) => {
    const slots = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeStr);
        }
    }

    return slots;
};

module.exports = {
    paginate,
    paginateResponse,
    formatDate,
    generateTimeSlots
};
