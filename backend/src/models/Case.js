const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Número de expediente interno (LEX-2025-001)'
  },
  externalNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de expediente del tribunal'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre descriptivo del caso'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lawyers',
      key: 'id'
    }
  },
  tribunalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tribunals',
      key: 'id'
    }
  },
  judgeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'judges',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM('Civil', 'Penal', 'Mercantil', 'Laboral', 'Familiar', 'Fiscal', 'Administrativo', 'Otro'),
    defaultValue: 'Civil'
  },
  status: {
    type: DataTypes.ENUM('Activo', 'Pendiente', 'Urgente', 'Apelación', 'Cerrado', 'Archivado'),
    defaultValue: 'Activo'
  },
  priority: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Urgente'),
    defaultValue: 'Media'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estimatedHours: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Horas estimadas para el caso'
  },
  billedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Horas facturadas hasta ahora'
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Valor estimado del caso en MXN'
  },
  billedAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Monto facturado hasta ahora'
  },
  nextHearingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tags separados por coma'
  }
}, {
  tableName: 'cases'
});

module.exports = Case;
