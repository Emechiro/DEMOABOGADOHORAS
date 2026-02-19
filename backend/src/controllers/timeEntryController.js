const { TimeEntry, Case, Lawyer, User, Activity } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las entradas de tiempo
exports.getAll = async (req, res) => {
  try {
    const {
      caseId, lawyerId, startDate, endDate, isBillable, status,
      page = 1, limit = 50, sortBy = 'date', sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (caseId) where.caseId = caseId;
    if (lawyerId) where.lawyerId = lawyerId;
    if (isBillable !== undefined) where.isBillable = isBillable === 'true';
    if (status) where.status = status;

    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await TimeEntry.findAndCountAll({
      where,
      include: [
        { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
        { model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular totales
    const totals = await TimeEntry.findAll({
      attributes: [
        [TimeEntry.sequelize.fn('SUM', TimeEntry.sequelize.col('hours')), 'totalHours'],
        [TimeEntry.sequelize.fn('SUM',
          TimeEntry.sequelize.literal("CASE WHEN is_billable = 1 THEN hours ELSE 0 END")
        ), 'billableHours'],
        [TimeEntry.sequelize.fn('SUM',
          TimeEntry.sequelize.literal("CASE WHEN is_billable = 1 THEN total_amount ELSE 0 END")
        ), 'totalAmount']
      ],
      where,
      raw: true
    });

    res.json({
      success: true,
      data: {
        timeEntries: rows,
        totals: totals[0] || { totalHours: 0, billableHours: 0, totalAmount: 0 },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener entradas de tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener entradas de tiempo',
      error: error.message
    });
  }
};

// Obtener una entrada de tiempo por ID
exports.getById = async (req, res) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id, {
      include: [
        { model: Case, as: 'case' },
        { model: Lawyer, as: 'lawyer' },
        { model: User, as: 'approver', attributes: ['id', 'name'] }
      ]
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de tiempo no encontrada'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener entrada de tiempo',
      error: error.message
    });
  }
};

// Crear entrada de tiempo
exports.create = async (req, res) => {
  try {
    const {
      caseId, lawyerId, date, startTime, endTime, hours,
      description, activityType, isBillable, hourlyRate
    } = req.body;

    // Validar caso y abogado
    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      return res.status(400).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    const lawyer = await Lawyer.findByPk(lawyerId);
    if (!lawyer) {
      return res.status(400).json({
        success: false,
        message: 'Abogado no encontrado'
      });
    }

    // Usar tarifa del abogado si no se especifica
    const rate = hourlyRate || lawyer.hourlyRate || 0;

    const entry = await TimeEntry.create({
      caseId,
      lawyerId,
      date: date || new Date(),
      startTime,
      endTime,
      hours,
      description,
      activityType: activityType || 'Otro',
      isBillable: isBillable !== false,
      hourlyRate: rate,
      totalAmount: hours * rate
    });

    // Actualizar horas facturadas del caso
    if (entry.isBillable) {
      await caseItem.increment('billedHours', { by: hours });
    }

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'time_entry_added',
      entityType: 'TimeEntry',
      entityId: entry.id,
      description: `${hours}h registradas en ${caseItem.caseNumber} por ${lawyer.name}`,
      metadata: { hours, caseId, lawyerId },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Entrada de tiempo creada exitosamente',
      data: entry
    });
  } catch (error) {
    console.error('Error al crear entrada de tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear entrada de tiempo',
      error: error.message
    });
  }
};

// Actualizar entrada de tiempo
exports.update = async (req, res) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de tiempo no encontrada'
      });
    }

    // No permitir editar si ya está facturada
    if (entry.status === 'Facturado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una entrada facturada'
      });
    }

    const oldHours = entry.hours;
    const oldBillable = entry.isBillable;

    const {
      date, startTime, endTime, hours,
      description, activityType, isBillable, hourlyRate
    } = req.body;

    await entry.update({
      date: date || entry.date,
      startTime: startTime !== undefined ? startTime : entry.startTime,
      endTime: endTime !== undefined ? endTime : entry.endTime,
      hours: hours || entry.hours,
      description: description || entry.description,
      activityType: activityType || entry.activityType,
      isBillable: isBillable !== undefined ? isBillable : entry.isBillable,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : entry.hourlyRate,
      totalAmount: (hours || entry.hours) * (hourlyRate !== undefined ? hourlyRate : entry.hourlyRate)
    });

    // Actualizar horas del caso si cambiaron
    if (hours !== oldHours || isBillable !== oldBillable) {
      const caseItem = await Case.findByPk(entry.caseId);
      if (caseItem) {
        if (oldBillable) {
          await caseItem.decrement('billedHours', { by: oldHours });
        }
        if (entry.isBillable) {
          await caseItem.increment('billedHours', { by: entry.hours });
        }
      }
    }

    res.json({
      success: true,
      message: 'Entrada de tiempo actualizada exitosamente',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar entrada de tiempo',
      error: error.message
    });
  }
};

// Eliminar entrada de tiempo
exports.delete = async (req, res) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de tiempo no encontrada'
      });
    }

    // No permitir eliminar si ya está facturada
    if (entry.status === 'Facturado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una entrada facturada'
      });
    }

    // Actualizar horas del caso
    if (entry.isBillable) {
      const caseItem = await Case.findByPk(entry.caseId);
      if (caseItem) {
        await caseItem.decrement('billedHours', { by: entry.hours });
      }
    }

    await entry.destroy();

    res.json({
      success: true,
      message: 'Entrada de tiempo eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar entrada de tiempo',
      error: error.message
    });
  }
};

// Aprobar entrada de tiempo
exports.approve = async (req, res) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de tiempo no encontrada'
      });
    }

    await entry.update({
      status: 'Aprobado',
      approvedBy: req.userId,
      approvedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Entrada de tiempo aprobada',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aprobar entrada de tiempo',
      error: error.message
    });
  }
};

// Obtener resumen mensual de horas
exports.getMonthlySummary = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), lawyerId } = req.query;

    const where = {
      date: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`]
      }
    };

    if (lawyerId) where.lawyerId = lawyerId;

    // Obtener horas por mes
    const monthlyData = await TimeEntry.findAll({
      attributes: [
        [TimeEntry.sequelize.fn('strftime', '%m', TimeEntry.sequelize.col('date')), 'month'],
        [TimeEntry.sequelize.fn('SUM', TimeEntry.sequelize.col('hours')), 'totalHours'],
        [TimeEntry.sequelize.fn('SUM',
          TimeEntry.sequelize.literal("CASE WHEN is_billable = 1 THEN hours ELSE 0 END")
        ), 'billableHours']
      ],
      where,
      group: [TimeEntry.sequelize.fn('strftime', '%m', TimeEntry.sequelize.col('date'))],
      order: [[TimeEntry.sequelize.fn('strftime', '%m', TimeEntry.sequelize.col('date')), 'ASC']],
      raw: true
    });

    // Formatear datos para todos los meses
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result = months.map((mes, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const data = monthlyData.find(m => m.month === monthNum);
      return {
        mes,
        horas: parseFloat(data?.totalHours || 0),
        horasFacturables: parseFloat(data?.billableHours || 0),
        meta: 350 // Meta por defecto
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen mensual',
      error: error.message
    });
  }
};
