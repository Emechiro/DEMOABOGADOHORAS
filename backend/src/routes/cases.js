const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Obtener todos los casos
router.get('/', caseController.getAll);

// Obtener estadísticas de casos
router.get('/stats', caseController.getStats);

// Obtener un caso por ID
router.get('/:id', caseController.getById);

// Crear caso
router.post('/', caseController.create);

// Actualizar caso
router.put('/:id', caseController.update);

// Eliminar (archivar) caso
router.delete('/:id', caseController.delete);

module.exports = router;
