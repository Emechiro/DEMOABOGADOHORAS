const express = require('express');
const router = express.Router();
const tribunalController = require('../controllers/tribunalController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Tribunales
router.get('/', tribunalController.getAll);
router.get('/:id', tribunalController.getById);
router.post('/', tribunalController.create);
router.put('/:id', tribunalController.update);
router.delete('/:id', tribunalController.delete);

// Jueces
router.get('/judges/all', tribunalController.getAllJudges);
router.post('/judges', tribunalController.createJudge);
router.put('/judges/:id', tribunalController.updateJudge);
router.delete('/judges/:id', tribunalController.deleteJudge);

module.exports = router;
