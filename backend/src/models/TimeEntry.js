const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases',
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Horas trabajadas'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción del trabajo realizado'
  },
  activityType: {
    type: DataTypes.ENUM(
      'Investigación',
      'Redacción',
      'Audiencia',
      'Reunión con cliente',
      'Llamada telefónica',
      'Revisión de documentos',
      'Negociación',
      'Consulta',
      'Otro'
    ),
    defaultValue: 'Otro'
  },
  isBillable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Tarifa por hora aplicada'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto total (hours * hourlyRate)'
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Facturado', 'Rechazado'),
    defaultValue: 'Pendiente'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'time_entries',
  hooks: {
    beforeSave: (entry) => {
      if (entry.hours && entry.hourlyRate) {
        entry.totalAmount = entry.hours * entry.hourlyRate;
      }
    }
  }
});

module.exports = TimeEntry;
