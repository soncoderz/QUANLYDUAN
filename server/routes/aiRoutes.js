const express = require('express');
const router = express.Router();
const { protect } = require('../middleware');
const { chat, getSuggestions } = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

// Chat with AI
router.post('/chat', chat);

// Get quick suggestions
router.get('/suggestions', getSuggestions);

module.exports = router;
