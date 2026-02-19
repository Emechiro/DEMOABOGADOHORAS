const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', timeEntryController.getAll);
router.get('/monthly-summary', timeEntryController.getMonthlySummary);
router.get('/:id', timeEntryController.getById);
router.post('/', timeEntryController.create);
router.put('/:id', timeEntryController.update);
router.put('/:id/approve', authorize('admin'), timeEntryController.approve);
router.delete('/:id', timeEntryController.delete);

module.exports = router;
