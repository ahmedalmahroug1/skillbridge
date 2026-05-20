// ==========================================
// routes/searchRoutes.js - مسارات البحث
// ==========================================

const express = require('express');
const router = express.Router();
const { searchProviders } = require('../controllers/searchController');

router.get('/providers', searchProviders);

module.exports = router;
