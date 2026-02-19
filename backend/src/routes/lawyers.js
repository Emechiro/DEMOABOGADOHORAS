const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todos los abogados
router.get('/', lawyerController.getAll);

// Obtener un abogado por ID
router.get('/:id', lawyerController.getById);

// Obtener casos de un abogado
router.get('/:id/cases', lawyerController.getCases);

// Obtener horas de un abogado
router.get('/:id/time-entries', lawyerController.getTimeEntries);

// Crear abogado (solo admin)
router.post('/', authorize('admin'), lawyerController.create);

// Actualizar abogado (admin o el propio abogado)
router.put('/:id', lawyerController.update);

// Eliminar abogado (solo admin)
router.delete('/:id', authorize('admin'), lawyerController.delete);

module.exports = router;
