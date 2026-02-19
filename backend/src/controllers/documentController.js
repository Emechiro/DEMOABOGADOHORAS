const { Document, Case, User, Activity } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Obtener todos los documentos
exports.getAll = async (req, res) => {
  try {
    const {
      caseId, category, type, search,
      page = 1, limit = 50
    } = req.query;

    const where = { isDeleted: false };

    if (caseId) where.caseId = caseId;
    if (category) where.category = category;
    if (type) where.extension = type.toLowerCase();

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { displayName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
        { model: User, as: 'uploader', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Estadísticas
    const totalSize = await Document.sum('size', { where: { isDeleted: false } });
    const byType = await Document.findAll({
      attributes: [
        'extension',
        [Document.sequelize.fn('COUNT', '*'), 'count'],
        [Document.sequelize.fn('SUM', Document.sequelize.col('size')), 'totalSize']
      ],
      where: { isDeleted: false },
      group: ['extension']
    });

    res.json({
      success: true,
      data: {
        documents: rows,
        stats: {
          totalSize: totalSize || 0,
          totalSizeMB: ((totalSize || 0) / 1024 / 1024).toFixed(2),
          byType
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
};

// Obtener un documento por ID
exports.getById = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, isDeleted: false },
      include: [
        { model: Case, as: 'case' },
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
        { model: Document, as: 'versions' }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener documento',
      error: error.message
    });
  }
};

// Subir documento
exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const { caseId, displayName, description, category, tags, isConfidential } = req.body;

    // Validar caso
    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      // Eliminar archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const document = await Document.create({
      caseId,
      uploadedBy: req.userId,
      name: req.file.originalname,
      displayName: displayName || req.file.originalname,
      description,
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extension: ext,
      category: category || 'Otro',
      tags,
      isConfidential: isConfidential === 'true'
    });

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'document_uploaded',
      entityType: 'Document',
      entityId: document.id,
      description: `Documento "${document.name}" subido a ${caseItem.caseNumber}`,
      metadata: { filename: document.name, size: document.size, caseId },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      data: document
    });
  } catch (error) {
    // Si hay error, eliminar archivo subido
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error al subir documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir documento',
      error: error.message
    });
  }
};

// Subir múltiples documentos
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos'
      });
    }

    const { caseId, category } = req.body;

    // Validar caso
    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      // Eliminar archivos subidos
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(400).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    const documents = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

      const document = await Document.create({
        caseId,
        uploadedBy: req.userId,
        name: file.originalname,
        displayName: file.originalname,
        filename: file.filename,
        filepath: file.path,
        mimetype: file.mimetype,
        size: file.size,
        extension: ext,
        category: category || 'Otro'
      });

      documents.push(document);
    }

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'document_uploaded',
      entityType: 'Document',
      entityId: documents[0].id,
      description: `${documents.length} documentos subidos a ${caseItem.caseNumber}`,
      metadata: { count: documents.length, caseId },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: `${documents.length} documentos subidos exitosamente`,
      data: documents
    });
  } catch (error) {
    console.error('Error al subir documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir documentos',
      error: error.message
    });
  }
};

// Descargar documento
exports.download = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, isDeleted: false }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    if (!fs.existsSync(document.filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    res.download(document.filepath, document.name);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al descargar documento',
      error: error.message
    });
  }
};

// Actualizar documento
exports.update = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, isDeleted: false }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const { displayName, description, category, tags, isConfidential } = req.body;

    await document.update({
      displayName: displayName || document.displayName,
      description: description !== undefined ? description : document.description,
      category: category || document.category,
      tags: tags !== undefined ? tags : document.tags,
      isConfidential: isConfidential !== undefined ? isConfidential : document.isConfidential
    });

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar documento',
      error: error.message
    });
  }
};

// Eliminar documento (soft delete)
exports.delete = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, isDeleted: false }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    await document.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.userId
    });

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'document_deleted',
      entityType: 'Document',
      entityId: document.id,
      description: `Documento "${document.name}" eliminado`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar documento',
      error: error.message
    });
  }
};

// Eliminar permanentemente (solo admin)
exports.permanentDelete = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Eliminar archivo físico
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    await document.destroy();

    res.json({
      success: true,
      message: 'Documento eliminado permanentemente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar documento',
      error: error.message
    });
  }
};
