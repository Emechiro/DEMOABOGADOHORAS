const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const lawyerRoutes = require('./lawyers');
const caseRoutes = require('./cases');
const clientRoutes = require('./clients');
const timeEntryRoutes = require('./timeEntries');
const hearingRoutes = require('./hearings');
const documentRoutes = require('./documents');
const tribunalRoutes = require('./tribunals');
const dashboardRoutes = require('./dashboard');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/lawyers', lawyerRoutes);
router.use('/cases', caseRoutes);
router.use('/clients', clientRoutes);
router.use('/time-entries', timeEntryRoutes);
router.use('/hearings', hearingRoutes);
router.use('/documents', documentRoutes);
router.use('/tribunals', tribunalRoutes);
router.use('/dashboard', dashboardRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LexFirm API v1.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      lawyers: '/api/lawyers',
      cases: '/api/cases',
      clients: '/api/clients',
      timeEntries: '/api/time-entries',
      hearings: '/api/hearings',
      documents: '/api/documents',
      tribunals: '/api/tribunals',
      dashboard: '/api/dashboard'
    }
  });
});

module.exports = router;
