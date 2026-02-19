const { Hearing, Case, Tribunal, Judge, Lawyer, Activity } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las audiencias
exports.getAll = async (req, res) => {
  try {
    const {
      caseId, tribunalId, status, startDate, endDate,
      page = 1, limit = 50, upcoming = false
    } = req.query;

    const where = {};

    if (caseId) where.caseId = caseId;
    if (tribunalId) where.tribunalId = tribunalId;
    if (status) where.status = status;

    if (upcoming === 'true') {
      where.date = { [Op.gte]: new Date() };
      where.status = { [Op.in]: ['Programada', 'Urgente'] };
    } else if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Hearing.findAndCountAll({
      where,
      include: [
        {
          model: Case, as: 'case',
          attributes: ['id', 'caseNumber', 'name', 'status'],
          include: [{ model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] }]
        },
        { model: Tribunal, as: 'tribunal', attributes: ['id', 'name'] },
        { model: Judge, as: 'judge', attributes: ['id', 'name', 'title'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        hearings: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener audiencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener audiencias',
      error: error.message
    });
  }
};

// Obtener próximas audiencias (para dashboard)
exports.getUpcoming = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const hearings = await Hearing.findAll({
      where: {
        date: { [Op.gte]: new Date() },
        status: { [Op.in]: ['Programada', 'Urgente'] }
      },
      include: [
        { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
        { model: Tribunal, as: 'tribunal', attributes: ['id', 'name'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: hearings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximas audiencias',
      error: error.message
    });
  }
};

// Obtener una audiencia por ID
exports.getById = async (req, res) => {
  try {
    const hearing = await Hearing.findByPk(req.params.id, {
      include: [
        {
          model: Case, as: 'case',
          include: [
            { model: Lawyer, as: 'lawyer' },
            { model: require('../models').Client, as: 'client' }
          ]
        },
        { model: Tribunal, as: 'tribunal' },
        { model: Judge, as: 'judge' }
      ]
    });

    if (!hearing) {
      return res.status(404).json({
        success: false,
        message: 'Audiencia no encontrada'
      });
    }

    res.json({
      success: true,
      data: hearing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener audiencia',
      error: error.message
    });
  }
};

// Crear audiencia
exports.create = async (req, res) => {
  try {
    const {
      caseId, tribunalId, judgeId, date, time, endTime,
      type, status, location, description, notes, reminder
    } = req.body;

    // Validar caso
    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      return res.status(400).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    const hearing = await Hearing.create({
      caseId,
      tribunalId: tribunalId || caseItem.tribunalId,
      judgeId: judgeId || caseItem.judgeId,
      date,
      time,
      endTime,
      type: type || 'Otro',
      status: status || 'Programada',
      location,
      description,
      notes,
      reminder: reminder !== false
    });

    // Actualizar próxima audiencia del caso
    await caseItem.update({ nextHearingDate: new Date(`${date}T${time}`) });

    // Registrar actividad
    await Activity.create({
      userId: req.userId,
      type: 'hearing_scheduled',
      entityType: 'Hearing',
      entityId: hearing.id,
      description: `Audiencia programada para ${caseItem.caseNumber} el ${date}`,
      metadata: { caseId, date, time },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Audiencia creada exitosamente',
      data: hearing
    });
  } catch (error) {
    console.error('Error al crear audiencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear audiencia',
      error: error.message
    });
  }
};

// Actualizar audiencia
exports.update = async (req, res) => {
  try {
    const hearing = await Hearing.findByPk(req.params.id);

    if (!hearing) {
      return res.status(404).json({
        success: false,
        message: 'Audiencia no encontrada'
      });
    }

    const {
      tribunalId, judgeId, date, time, endTime,
      type, status, location, description, notes, result, reminder
    } = req.body;

    await hearing.update({
      tribunalId: tribunalId !== undefined ? tribunalId : hearing.tribunalId,
      judgeId: judgeId !== undefined ? judgeId : hearing.judgeId,
      date: date || hearing.date,
      time: time || hearing.time,
      endTime: endTime !== undefined ? endTime : hearing.endTime,
      type: type || hearing.type,
      status: status || hearing.status,
      location: location !== undefined ? location : hearing.location,
      description: description !== undefined ? description : hearing.description,
      notes: notes !== undefined ? notes : hearing.notes,
      result: result !== undefined ? result : hearing.result,
      reminder: reminder !== undefined ? reminder : hearing.reminder
    });

    // Si se completó, registrar actividad
    if (status === 'Completada') {
      await Activity.create({
        userId: req.userId,
        type: 'hearing_completed',
        entityType: 'Hearing',
        entityId: hearing.id,
        description: `Audiencia completada para caso ${hearing.caseId}`,
        ipAddress: req.ip
      });
    }

    res.json({
      success: true,
      message: 'Audiencia actualizada exitosamente',
      data: hearing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar audiencia',
      error: error.message
    });
  }
};

// Eliminar audiencia
exports.delete = async (req, res) => {
  try {
    const hearing = await Hearing.findByPk(req.params.id);

    if (!hearing) {
      return res.status(404).json({
        success: false,
        message: 'Audiencia no encontrada'
      });
    }

    await hearing.destroy();

    res.json({
      success: true,
      message: 'Audiencia eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar audiencia',
      error: error.message
    });
  }
};

// Obtener calendario de audiencias
exports.getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const hearings = await Hearing.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [
        { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
        { model: Tribunal, as: 'tribunal', attributes: ['id', 'name'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    // Agrupar por día
    const calendar = {};
    hearings.forEach(h => {
      const day = h.date;
      if (!calendar[day]) calendar[day] = [];
      calendar[day].push(h);
    });

    res.json({
      success: true,
      data: {
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
        hearings,
        calendar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener calendario',
      error: error.message
    });
  }
};
