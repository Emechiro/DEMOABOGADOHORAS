const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lawyer = sequelize.define('Lawyer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Dr., Lic., Mtro., etc.'
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Derecho Civil, Penal, Mercantil, etc.'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Activo', 'Licencia', 'Inactivo'),
    defaultValue: 'Activo'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Tarifa por hora en MXN'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'lawyers'
});

module.exports = Lawyer;
