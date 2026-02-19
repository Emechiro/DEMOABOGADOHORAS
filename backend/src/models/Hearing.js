const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hearing = sequelize.define('Hearing', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(
      'Audiencia Inicial',
      'Audiencia de Pruebas',
      'Audiencia de Alegatos',
      'Audiencia de Sentencia',
      'Conciliación',
      'Mediación',
      'Comparecencia',
      'Declaración',
      'Otro'
    ),
    defaultValue: 'Otro'
  },
  status: {
    type: DataTypes.ENUM('Programada', 'Completada', 'Cancelada', 'Pospuesta', 'Urgente'),
    defaultValue: 'Programada'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Sala, juzgado específico, etc.'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas de preparación o resultado'
  },
  result: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Resultado de la audiencia'
  },
  reminder: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'hearings'
});

module.exports = Hearing;
