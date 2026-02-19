const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Judge = sequelize.define('Judge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Juez, Jueza, Magistrado, Árbitro, Notario, etc.'
  },
  tribunalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tribunals',
      key: 'id'
    }
  },
  specialty: {
    type: DataTypes.STRING,
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre preferencias, estilo, etc.'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'judges'
});

module.exports = Judge;
