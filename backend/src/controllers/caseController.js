const { Case, Client, Lawyer, Tribunal, Judge, TimeEntry, Hearing, Document, Activity } = require('../models');
const { Op } = require('sequelize');

// Generar número de caso
const generateCaseNumber = async () => {
  const year = new Date().getFullYear();
  const lastCase = await Case.findOne({
    where: {
      caseNumber: { [Op.like]: `LEX-${year}-%` }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNum = 1;
  if (lastCase) {
    const parts = lastCase.caseNumber.split('-');
    nextNum = parseInt(parts[2]) + 1;
  }

  return `LEX-${year}-${String(nextNum).padStart(3, '0')}`;
};

// Obtener todos los casos
exports.getAll = async (req, res) => {
  try {
    const {
      status, category, priority, lawyerId, tribunalId, judgeId, clientId,
      search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (lawyerId) where.lawyerId = lawyerId;
    if (tribunalId) where.tribunalId = tribunalId;
    if (judgeId) where.judgeId = judgeId;
    if (clientId) where.clientId = clientId;

    if (search) {
      where[Op.or] = [
        { caseNumber: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { externalNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Case.findAndCountAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'type'] },
        { model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar', 'specialty'] },
        { model: Tribunal, as: 'tribunal', attributes: ['id', 'name', 'type'] },
        { model: Judge, as: 'judge', attributes: ['id', 'name', 'title'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        cases: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener casos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener casos',
      error: error.message
    });
  }
};

// Obtener un caso por ID
exports.getById = async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Lawyer, as: 'lawyer' },
        { model: Tribunal, as: 'tribunal' },
        { model: Judge, as: 'judge' },
        {
          model: Hearing, as: 'hearings',
          limit: 10,
          order: [['date', 'DESC']]
        },
        {
          model: Document, as: 'documents',
          where: { isDeleted: false },
          required: false,
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    // Obtener estadísticas de horas
    const totalHours = await TimeEntry.sum('hours', {
      where: { caseId: caseItem.id }
    });
    const billableHours = await TimeEntry.sum('hours', {
      where: { caseId: caseItem.id, isBillable: true }
    });

    // Próxima audiencia
    const nextHearing = await Hearing.findOne({
      where: {
        caseId: caseItem.id,
        date: { [Op.gte]: new Date() },
        status: { [Op.in]: ['Programada', 'Urgente'] }
      },
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        ...caseItem.toJSON(),
        stats: {
          totalHours: totalHours || 0,
          billableHours: billableHours || 0,
          hoursRemaining: caseItem.estimatedHours - (totalHours || 0),
          hoursProgress: ((totalHours || 0) / caseItem.estimatedHours * 100).toFixed(1)
        },
        nextHearing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener caso',
      error: error.message
    });
  }
};

// Crear caso
exports.create = async (req, res) => {
  try {
    const {
      name, description, clientId, lawyerId, tribunalId, judgeId,
      category, status, priority, startDate, estimatedHours,
      estimatedValue, externalNumber, notes, tags
    } = req.body;

    // Validar que cliente y abogado existan
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const lawyer = await Lawyer.findByPk(lawyerId);
    if (!lawyer) {
      return res.status(400).json({
        success: false,
        message: 'Abogado no encontrado'
      });
    }

    // Generar número de caso
    const caseNumber = await generateCaseNumber();

    const newCase = await Case.create({
      caseNumber,
      externalNumber,
      name,
      description,
      clientId,
      lawyerId,
      tribunalId,
      judgeId,
      category: category || 'Civil',
      status: status || 'Activo',
      priority: priority || 'Media',
      startDate: startDate || new Date(),
      estimatedHours: estimatedHours || 100,
      estimatedValue: estimatedValue || 0,
      notes,
      tags
    });

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'case_created',
      entityType: 'Case',
      entityId: newCase.id,
      description: `Nuevo caso creado: ${newCase.caseNumber} - ${newCase.name}`,
      ipAddress: req.ip
    });

    // Cargar relaciones
    const caseWithRelations = await Case.findByPk(newCase.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Lawyer, as: 'lawyer' },
        { model: Tribunal, as: 'tribunal' },
        { model: Judge, as: 'judge' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Caso creado exitosamente',
      data: caseWithRelations
    });
  } catch (error) {
    console.error('Error al crear caso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear caso',
      error: error.message
    });
  }
};

// Actualizar caso
exports.update = async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    const oldStatus = caseItem.status;

    const {
      name, description, clientId, lawyerId, tribunalId, judgeId,
      category, status, priority, startDate, endDate, estimatedHours,
      estimatedValue, externalNumber, notes, tags, nextHearingDate
    } = req.body;

    await caseItem.update({
      name: name || caseItem.name,
      description: description !== undefined ? description : caseItem.description,
      clientId: clientId || caseItem.clientId,
      lawyerId: lawyerId || caseItem.lawyerId,
      tribunalId: tribunalId !== undefined ? tribunalId : caseItem.tribunalId,
      judgeId: judgeId !== undefined ? judgeId : caseItem.judgeId,
      category: category || caseItem.category,
      status: status || caseItem.status,
      priority: priority || caseItem.priority,
      startDate: startDate || caseItem.startDate,
      endDate: endDate !== undefined ? endDate : caseItem.endDate,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : caseItem.estimatedHours,
      estimatedValue: estimatedValue !== undefined ? estimatedValue : caseItem.estimatedValue,
      externalNumber: externalNumber !== undefined ? externalNumber : caseItem.externalNumber,
      notes: notes !== undefined ? notes : caseItem.notes,
      tags: tags !== undefined ? tags : caseItem.tags,
      nextHearingDate: nextHearingDate !== undefined ? nextHearingDate : caseItem.nextHearingDate
    });

    // Registrar actividad si cambió el estado
    if (status && status !== oldStatus) {
      await Activity.create({
        userId: req.userId,
        type: status === 'Cerrado' ? 'case_closed' : 'case_updated',
        entityType: 'Case',
        entityId: caseItem.id,
        description: `Caso ${caseItem.caseNumber} cambió de ${oldStatus} a ${status}`,
        metadata: { oldStatus, newStatus: status },
        ipAddress: req.ip
      });
    }

    res.json({
      success: true,
      message: 'Caso actualizado exitosamente',
      data: caseItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar caso',
      error: error.message
    });
  }
};

// Eliminar caso (soft delete - cambiar a archivado)
exports.delete = async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    // Cambiar a archivado en lugar de eliminar
    await caseItem.update({
      status: 'Archivado',
      endDate: new Date()
    });

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'case_closed',
      entityType: 'Case',
      entityId: caseItem.id,
      description: `Caso ${caseItem.caseNumber} archivado`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Caso archivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al archivar caso',
      error: error.message
    });
  }
};

// Obtener estadísticas de casos
exports.getStats = async (req, res) => {
  try {
    const totalCases = await Case.count();
    const activeCases = await Case.count({
      where: { status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente', 'Apelación'] } }
    });
    const closedCases = await Case.count({ where: { status: 'Cerrado' } });

    // Por categoría
    const byCategory = await Case.findAll({
      attributes: [
        'category',
        [Case.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: { status: { [Op.ne]: 'Archivado' } },
      group: ['category']
    });

    // Por status
    const byStatus = await Case.findAll({
      attributes: [
        'status',
        [Case.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    // Casos por abogado
    const byLawyer = await Case.findAll({
      attributes: [
        'lawyerId',
        [Case.sequelize.fn('COUNT', '*'), 'count']
      ],
      include: [{ model: Lawyer, as: 'lawyer', attributes: ['name'] }],
      where: { status: { [Op.ne]: 'Archivado' } },
      group: ['lawyerId', 'lawyer.id']
    });

    res.json({
      success: true,
      data: {
        totals: {
          total: totalCases,
          active: activeCases,
          closed: closedCases
        },
        byCategory,
        byStatus,
        byLawyer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
