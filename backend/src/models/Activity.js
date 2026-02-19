const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
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
  type: {
    type: DataTypes.ENUM(
      'case_created',
      'case_updated',
      'case_closed',
      'hearing_scheduled',
      'hearing_completed',
      'document_uploaded',
      'document_deleted',
      'time_entry_added',
      'client_added',
      'lawyer_added',
      'user_login',
      'user_logout',
      'other'
    ),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Case, Hearing, Document, etc.'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales en formato JSON'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'activities'
});

module.exports = Activity;
