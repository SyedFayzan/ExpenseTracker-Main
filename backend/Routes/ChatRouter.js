const express = require('express');
const { chat } = require('../Controllers/ChatController');
const router = express.Router();

router.post('/', chat);

module.exports = router;
