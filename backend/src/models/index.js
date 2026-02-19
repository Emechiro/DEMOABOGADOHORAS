const sequelize = require('../config/database');
const User = require('./User');
const Lawyer = require('./Lawyer');
const Client = require('./Client');
const Tribunal = require('./Tribunal');
const Judge = require('./Judge');
const Case = require('./Case');
const TimeEntry = require('./TimeEntry');
const Hearing = require('./Hearing');
const Document = require('./Document');
const Activity = require('./Activity');

// =====================
// ASSOCIATIONS / RELACIONES
// =====================

// User - Lawyer (Un usuario puede ser un abogado)
User.hasOne(Lawyer, { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Tribunal - Judge (Un tribunal tiene muchos jueces)
Tribunal.hasMany(Judge, { foreignKey: 'tribunalId', as: 'judges' });
Judge.belongsTo(Tribunal, { foreignKey: 'tribunalId', as: 'tribunal' });

// Client - Case (Un cliente tiene muchos casos)
Client.hasMany(Case, { foreignKey: 'clientId', as: 'cases' });
Case.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Lawyer - Case (Un abogado tiene muchos casos)
Lawyer.hasMany(Case, { foreignKey: 'lawyerId', as: 'cases' });
Case.belongsTo(Lawyer, { foreignKey: 'lawyerId', as: 'lawyer' });

// Tribunal - Case (Un tribunal tiene muchos casos)
Tribunal.hasMany(Case, { foreignKey: 'tribunalId', as: 'cases' });
Case.belongsTo(Tribunal, { foreignKey: 'tribunalId', as: 'tribunal' });

// Judge - Case (Un juez tiene muchos casos)
Judge.hasMany(Case, { foreignKey: 'judgeId', as: 'cases' });
Case.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });

// Case - TimeEntry (Un caso tiene muchas entradas de tiempo)
Case.hasMany(TimeEntry, { foreignKey: 'caseId', as: 'timeEntries' });
TimeEntry.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Lawyer - TimeEntry (Un abogado tiene muchas entradas de tiempo)
Lawyer.hasMany(TimeEntry, { foreignKey: 'lawyerId', as: 'timeEntries' });
TimeEntry.belongsTo(Lawyer, { foreignKey: 'lawyerId', as: 'lawyer' });

// User - TimeEntry (Aprobación)
User.hasMany(TimeEntry, { foreignKey: 'approvedBy', as: 'approvedTimeEntries' });
TimeEntry.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Case - Hearing (Un caso tiene muchas audiencias)
Case.hasMany(Hearing, { foreignKey: 'caseId', as: 'hearings' });
Hearing.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Tribunal - Hearing
Tribunal.hasMany(Hearing, { foreignKey: 'tribunalId', as: 'hearings' });
Hearing.belongsTo(Tribunal, { foreignKey: 'tribunalId', as: 'tribunal' });

// Judge - Hearing
Judge.hasMany(Hearing, { foreignKey: 'judgeId', as: 'hearings' });
Hearing.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });

// Case - Document (Un caso tiene muchos documentos)
Case.hasMany(Document, { foreignKey: 'caseId', as: 'documents' });
Document.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// User - Document (Un usuario sube documentos)
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Document - Document (Versiones)
Document.hasMany(Document, { foreignKey: 'parentDocumentId', as: 'versions' });
Document.belongsTo(Document, { foreignKey: 'parentDocumentId', as: 'parentDocument' });

// User - Activity
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  User,
  Lawyer,
  Client,
  Tribunal,
  Judge,
  Case,
  TimeEntry,
  Hearing,
  Document,
  Activity
};
