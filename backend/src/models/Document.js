const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'id'
    }
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre original del archivo'
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre para mostrar'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre almacenado en el servidor'
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tamaño en bytes'
  },
  extension: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'Escritos Legales',
      'Contratos',
      'Evidencia',
      'Reportes',
      'Sentencias',
      'Notificaciones',
      'Correspondencia',
      'Identificaciones',
      'Poderes',
      'Otro'
    ),
    defaultValue: 'Otro'
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tags separados por coma'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  parentDocumentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Para versiones de documentos'
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deletedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'documents'
});

module.exports = Document;
