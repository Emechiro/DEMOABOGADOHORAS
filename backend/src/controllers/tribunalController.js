const { Tribunal, Judge, Case } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los tribunales
exports.getAll = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;

    const where = { isActive: true };

    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { jurisdiction: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Tribunal.findAndCountAll({
      where,
      include: [
        { model: Judge, as: 'judges', where: { isActive: true }, required: false }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Agregar conteo de casos para cada tribunal
    const tribunalsWithStats = await Promise.all(rows.map(async (tribunal) => {
      const caseCount = await Case.count({
        where: { tribunalId: tribunal.id, status: { [Op.ne]: 'Archivado' } }
      });
      const activeCases = await Case.count({
        where: { tribunalId: tribunal.id, status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente'] } }
      });

      return {
        ...tribunal.toJSON(),
        caseCount,
        activeCases
      };
    }));

    res.json({
      success: true,
      data: {
        tribunals: tribunalsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener tribunales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tribunales',
      error: error.message
    });
  }
};

// Obtener un tribunal por ID
exports.getById = async (req, res) => {
  try {
    const tribunal = await Tribunal.findByPk(req.params.id, {
      include: [
        { model: Judge, as: 'judges' },
        {
          model: Case, as: 'cases',
          limit: 20,
          order: [['createdAt', 'DESC']],
          include: [{ model: require('../models').Lawyer, as: 'lawyer', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: 'Tribunal no encontrado'
      });
    }

    // Estadísticas
    const totalCases = await Case.count({ where: { tribunalId: tribunal.id } });
    const byStatus = await Case.findAll({
      attributes: [
        'status',
        [Case.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: { tribunalId: tribunal.id },
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        ...tribunal.toJSON(),
        stats: {
          totalCases,
          byStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tribunal',
      error: error.message
    });
  }
};

// Crear tribunal
exports.create = async (req, res) => {
  try {
    const { name, type, jurisdiction, address, phone, email, schedule, notes } = req.body;

    const tribunal = await Tribunal.create({
      name,
      type: type || 'Civil',
      jurisdiction,
      address,
      phone,
      email,
      schedule,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Tribunal creado exitosamente',
      data: tribunal
    });
  } catch (error) {
    console.error('Error al crear tribunal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tribunal',
      error: error.message
    });
  }
};

// Actualizar tribunal
exports.update = async (req, res) => {
  try {
    const tribunal = await Tribunal.findByPk(req.params.id);

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: 'Tribunal no encontrado'
      });
    }

    const { name, type, jurisdiction, address, phone, email, schedule, notes, isActive } = req.body;

    await tribunal.update({
      name: name || tribunal.name,
      type: type || tribunal.type,
      jurisdiction: jurisdiction !== undefined ? jurisdiction : tribunal.jurisdiction,
      address: address !== undefined ? address : tribunal.address,
      phone: phone !== undefined ? phone : tribunal.phone,
      email: email !== undefined ? email : tribunal.email,
      schedule: schedule !== undefined ? schedule : tribunal.schedule,
      notes: notes !== undefined ? notes : tribunal.notes,
      isActive: isActive !== undefined ? isActive : tribunal.isActive
    });

    res.json({
      success: true,
      message: 'Tribunal actualizado exitosamente',
      data: tribunal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tribunal',
      error: error.message
    });
  }
};

// Eliminar tribunal
exports.delete = async (req, res) => {
  try {
    const tribunal = await Tribunal.findByPk(req.params.id);

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: 'Tribunal no encontrado'
      });
    }

    // Verificar si tiene casos
    const caseCount = await Case.count({ where: { tribunalId: tribunal.id } });
    if (caseCount > 0) {
      // Soft delete
      await tribunal.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Tribunal desactivado (tiene casos asociados)'
      });
    }

    await tribunal.destroy();

    res.json({
      success: true,
      message: 'Tribunal eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tribunal',
      error: error.message
    });
  }
};

// =====================
// JUECES
// =====================

// Obtener todos los jueces
exports.getAllJudges = async (req, res) => {
  try {
    const { tribunalId, search, page = 1, limit = 50 } = req.query;

    const where = { isActive: true };

    if (tribunalId) where.tribunalId = tribunalId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Judge.findAndCountAll({
      where,
      include: [{ model: Tribunal, as: 'tribunal', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Agregar conteo de casos
    const judgesWithStats = await Promise.all(rows.map(async (judge) => {
      const caseCount = await Case.count({ where: { judgeId: judge.id } });
      return { ...judge.toJSON(), caseCount };
    }));

    res.json({
      success: true,
      data: {
        judges: judgesWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jueces',
      error: error.message
    });
  }
};

// Crear juez
exports.createJudge = async (req, res) => {
  try {
    const { name, title, tribunalId, specialty, phone, email, notes } = req.body;

    const judge = await Judge.create({
      name,
      title,
      tribunalId,
      specialty,
      phone,
      email,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Juez creado exitosamente',
      data: judge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear juez',
      error: error.message
    });
  }
};

// Actualizar juez
exports.updateJudge = async (req, res) => {
  try {
    const judge = await Judge.findByPk(req.params.id);

    if (!judge) {
      return res.status(404).json({
        success: false,
        message: 'Juez no encontrado'
      });
    }

    const { name, title, tribunalId, specialty, phone, email, notes, isActive } = req.body;

    await judge.update({
      name: name || judge.name,
      title: title !== undefined ? title : judge.title,
      tribunalId: tribunalId !== undefined ? tribunalId : judge.tribunalId,
      specialty: specialty !== undefined ? specialty : judge.specialty,
      phone: phone !== undefined ? phone : judge.phone,
      email: email !== undefined ? email : judge.email,
      notes: notes !== undefined ? notes : judge.notes,
      isActive: isActive !== undefined ? isActive : judge.isActive
    });

    res.json({
      success: true,
      message: 'Juez actualizado exitosamente',
      data: judge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar juez',
      error: error.message
    });
  }
};

// Eliminar juez
exports.deleteJudge = async (req, res) => {
  try {
    const judge = await Judge.findByPk(req.params.id);

    if (!judge) {
      return res.status(404).json({
        success: false,
        message: 'Juez no encontrado'
      });
    }

    // Soft delete
    await judge.update({ isActive: false });

    res.json({
      success: true,
      message: 'Juez desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar juez',
      error: error.message
    });
  }
};
