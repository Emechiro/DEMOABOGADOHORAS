const { Lawyer, Case, TimeEntry, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los abogados
exports.getAll = async (req, res) => {
  try {
    const { status, specialty, search, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status) where.status = status;
    if (specialty) where.specialty = specialty;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { specialty: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Lawyer.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'lastLogin'] }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Agregar conteo de casos y horas para cada abogado
    const lawyersWithStats = await Promise.all(rows.map(async (lawyer) => {
      const caseCount = await Case.count({ where: { lawyerId: lawyer.id } });
      const urgentCount = await Case.count({
        where: { lawyerId: lawyer.id, status: 'Urgente' }
      });

      // Calcular horas del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const hoursResult = await TimeEntry.sum('hours', {
        where: {
          lawyerId: lawyer.id,
          date: { [Op.gte]: startOfMonth },
          isBillable: true
        }
      });

      return {
        ...lawyer.toJSON(),
        caseCount,
        urgentCount,
        monthlyHours: hoursResult || 0
      };
    }));

    res.json({
      success: true,
      data: {
        lawyers: lawyersWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener abogados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener abogados',
      error: error.message
    });
  }
};

// Obtener un abogado por ID
exports.getById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'lastLogin'] },
        {
          model: Case,
          as: 'cases',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Abogado no encontrado'
      });
    }

    // Estadísticas del abogado
    const totalCases = await Case.count({ where: { lawyerId: lawyer.id } });
    const activeCases = await Case.count({
      where: { lawyerId: lawyer.id, status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente'] } }
    });
    const closedCases = await Case.count({
      where: { lawyerId: lawyer.id, status: 'Cerrado' }
    });

    // Horas totales
    const totalHours = await TimeEntry.sum('hours', {
      where: { lawyerId: lawyer.id, isBillable: true }
    });

    // Horas del mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyHours = await TimeEntry.sum('hours', {
      where: {
        lawyerId: lawyer.id,
        date: { [Op.gte]: startOfMonth },
        isBillable: true
      }
    });

    res.json({
      success: true,
      data: {
        ...lawyer.toJSON(),
        stats: {
          totalCases,
          activeCases,
          closedCases,
          totalHours: totalHours || 0,
          monthlyHours: monthlyHours || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener abogado',
      error: error.message
    });
  }
};

// Crear abogado
exports.create = async (req, res) => {
  try {
    const {
      name, title, specialty, email, phone,
      avatar, status, hourlyRate, bio, hireDate, userId
    } = req.body;

    // Verificar si el email ya existe
    const existing = await Lawyer.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un abogado con ese email'
      });
    }

    const lawyer = await Lawyer.create({
      name,
      title,
      specialty,
      email,
      phone,
      avatar,
      status: status || 'Activo',
      hourlyRate: hourlyRate || 0,
      bio,
      hireDate,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Abogado creado exitosamente',
      data: lawyer
    });
  } catch (error) {
    console.error('Error al crear abogado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear abogado',
      error: error.message
    });
  }
};

// Actualizar abogado
exports.update = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Abogado no encontrado'
      });
    }

    const {
      name, title, specialty, email, phone,
      avatar, status, hourlyRate, bio, hireDate
    } = req.body;

    // Verificar email único si cambió
    if (email && email !== lawyer.email) {
      const existing = await Lawyer.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un abogado con ese email'
        });
      }
    }

    await lawyer.update({
      name: name || lawyer.name,
      title: title !== undefined ? title : lawyer.title,
      specialty: specialty || lawyer.specialty,
      email: email || lawyer.email,
      phone: phone !== undefined ? phone : lawyer.phone,
      avatar: avatar !== undefined ? avatar : lawyer.avatar,
      status: status || lawyer.status,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : lawyer.hourlyRate,
      bio: bio !== undefined ? bio : lawyer.bio,
      hireDate: hireDate !== undefined ? hireDate : lawyer.hireDate
    });

    res.json({
      success: true,
      message: 'Abogado actualizado exitosamente',
      data: lawyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar abogado',
      error: error.message
    });
  }
};

// Eliminar abogado
exports.delete = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Abogado no encontrado'
      });
    }

    // Verificar si tiene casos activos
    const activeCases = await Case.count({
      where: {
        lawyerId: lawyer.id,
        status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente', 'Apelación'] }
      }
    });

    if (activeCases > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. El abogado tiene ${activeCases} casos activos.`
      });
    }

    await lawyer.destroy();

    res.json({
      success: true,
      message: 'Abogado eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar abogado',
      error: error.message
    });
  }
};

// Obtener casos de un abogado
exports.getCases = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const lawyerId = req.params.id;

    const where = { lawyerId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await Case.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener casos del abogado',
      error: error.message
    });
  }
};

// Obtener horas de un abogado
exports.getTimeEntries = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const lawyerId = req.params.id;

    const where = { lawyerId };

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
      include: [{ model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular totales
    const totalHours = await TimeEntry.sum('hours', { where });
    const billableHours = await TimeEntry.sum('hours', {
      where: { ...where, isBillable: true }
    });

    res.json({
      success: true,
      data: {
        timeEntries: rows,
        totals: {
          totalHours: totalHours || 0,
          billableHours: billableHours || 0,
          nonBillableHours: (totalHours || 0) - (billableHours || 0)
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener horas del abogado',
      error: error.message
    });
  }
};
