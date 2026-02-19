const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tribunal = sequelize.define('Tribunal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Civil', 'Penal', 'Mercantil', 'Laboral', 'Familiar', 'Fiscal', 'Administrativo', 'Arbitraje', 'Otro'),
    defaultValue: 'Civil'
  },
  jurisdiction: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'CDMX, Estado de México, Federal, etc.'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Horario de atención'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tribunals'
});

module.exports = Tribunal;
