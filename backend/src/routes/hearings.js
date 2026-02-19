const express = require('express');
const router = express.Router();
const hearingController = require('../controllers/hearingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', hearingController.getAll);
router.get('/upcoming', hearingController.getUpcoming);
router.get('/calendar', hearingController.getCalendar);
router.get('/:id', hearingController.getById);
router.post('/', hearingController.create);
router.put('/:id', hearingController.update);
router.delete('/:id', hearingController.delete);

module.exports = router;
