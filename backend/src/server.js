const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LexFirm Backend API',
    version: '1.0.0',
    documentation: '/api',
    status: 'Running'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Sincronizar base de datos
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Base de datos sincronizada');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  LexFirm Backend API v1.0                             ║
║                                                            ║
║   Servidor corriendo en: http://localhost:${PORT}            ║
║   API disponible en:     http://localhost:${PORT}/api        ║
║                                                            ║
║   Endpoints principales:                                   ║
║   • POST /api/auth/login     - Iniciar sesión             ║
║   • GET  /api/dashboard      - Dashboard completo         ║
║   • GET  /api/cases          - Listar casos               ║
║   • GET  /api/lawyers        - Listar abogados            ║
║   • GET  /api/hearings       - Listar audiencias          ║
║   • GET  /api/documents      - Listar documentos          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
