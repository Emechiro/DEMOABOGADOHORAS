const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Dashboard completo
router.get('/', dashboardController.getFullDashboard);

// Endpoints individuales
router.get('/stats', dashboardController.getStats);
router.get('/cases-by-category', dashboardController.getCasesByCategory);
router.get('/monthly-hours', dashboardController.getMonthlyHours);
router.get('/recent-cases', dashboardController.getRecentCases);
router.get('/upcoming-hearings', dashboardController.getUpcomingHearings);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
