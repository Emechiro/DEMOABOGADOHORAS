const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.get('/:id/cases', clientController.getCases);
router.post('/', clientController.create);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.delete);

module.exports = router;
