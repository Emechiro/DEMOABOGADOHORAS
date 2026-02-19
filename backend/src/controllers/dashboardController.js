const { Case, Lawyer, Client, TimeEntry, Hearing, Document, Activity } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas generales del dashboard
exports.getStats = async (req, res) => {
  try {
    // Casos
    const totalCases = await Case.count({ where: { status: { [Op.ne]: 'Archivado' } } });
    const activeCases = await Case.count({
      where: { status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente', 'Apelación'] } }
    });
    const urgentCases = await Case.count({ where: { status: 'Urgente' } });
    const closedCasesThisMonth = await Case.count({
      where: {
        status: 'Cerrado',
        endDate: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    });

    // Abogados
    const totalLawyers = await Lawyer.count({ where: { status: 'Activo' } });

    // Horas del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyHours = await TimeEntry.sum('hours', {
      where: {
        date: { [Op.gte]: startOfMonth },
        isBillable: true
      }
    }) || 0;

    // Horas del mes anterior para comparación
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setDate(endOfLastMonth.getDate() - 1);

    const lastMonthHours = await TimeEntry.sum('hours', {
      where: {
        date: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        isBillable: true
      }
    }) || 0;

    const hoursChange = lastMonthHours > 0
      ? ((monthlyHours - lastMonthHours) / lastMonthHours * 100).toFixed(1)
      : 0;

    // Audiencias del mes
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    const monthlyHearings = await Hearing.count({
      where: {
        date: { [Op.between]: [startOfMonth, endOfMonth] },
        status: { [Op.in]: ['Programada', 'Urgente'] }
      }
    });

    // Próximas audiencias (7 días)
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const upcomingHearings = await Hearing.count({
      where: {
        date: { [Op.between]: [new Date(), next7Days] },
        status: { [Op.in]: ['Programada', 'Urgente'] }
      }
    });

    res.json({
      success: true,
      data: {
        cases: {
          total: totalCases,
          active: activeCases,
          urgent: urgentCases,
          closedThisMonth: closedCasesThisMonth
        },
        lawyers: {
          total: totalLawyers
        },
        hours: {
          monthly: parseFloat(monthlyHours.toFixed(1)),
          change: parseFloat(hoursChange),
          lastMonth: parseFloat(lastMonthHours.toFixed(1))
        },
        hearings: {
          monthly: monthlyHearings,
          upcoming: upcomingHearings
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener distribución de casos por categoría
exports.getCasesByCategory = async (req, res) => {
  try {
    const distribution = await Case.findAll({
      attributes: [
        'category',
        [Case.sequelize.fn('COUNT', '*'), 'value']
      ],
      where: { status: { [Op.ne]: 'Archivado' } },
      group: ['category'],
      raw: true
    });

    const colors = {
      'Civil': '#c9a84c',
      'Penal': '#e05555',
      'Mercantil': '#5b8dee',
      'Laboral': '#4caf7d',
      'Familiar': '#b06bd4',
      'Fiscal': '#f5a623',
      'Administrativo': '#70708a',
      'Otro': '#9090a8'
    };

    const result = distribution.map(d => ({
      name: d.category,
      value: parseInt(d.value),
      color: colors[d.category] || '#9090a8'
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribución de casos',
      error: error.message
    });
  }
};

// Obtener horas mensuales (para gráfica)
exports.getMonthlyHours = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), target = 350 } = req.query;

    // Obtener datos de los últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        name: date.toLocaleString('es-MX', { month: 'short' })
      });
    }

    const result = await Promise.all(months.map(async (m) => {
      const startDate = new Date(m.year, m.month - 1, 1);
      const endDate = new Date(m.year, m.month, 0);

      const hours = await TimeEntry.sum('hours', {
        where: {
          date: { [Op.between]: [startDate, endDate] },
          isBillable: true
        }
      }) || 0;

      return {
        mes: m.name.charAt(0).toUpperCase() + m.name.slice(1),
        horas: parseFloat(hours.toFixed(0)),
        meta: parseInt(target)
      };
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horas mensuales',
      error: error.message
    });
  }
};

// Obtener casos recientes
exports.getRecentCases = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const cases = await Case.findAll({
      include: [
        { model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] },
        { model: require('../models').Judge, as: 'judge', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener casos recientes',
      error: error.message
    });
  }
};

// Obtener próximas audiencias
exports.getUpcomingHearings = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const hearings = await Hearing.findAll({
      where: {
        date: { [Op.gte]: new Date() },
        status: { [Op.in]: ['Programada', 'Urgente'] }
      },
      include: [
        { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
        { model: require('../models').Tribunal, as: 'tribunal', attributes: ['id', 'name'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: parseInt(limit)
    });

    // Formatear datos
    const result = hearings.map(h => ({
      id: h.id,
      date: new Date(h.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      time: h.time?.slice(0, 5) || '',
      case: h.case?.name || '',
      caseNumber: h.case?.caseNumber || '',
      tribunal: h.tribunal?.name || '',
      type: h.status === 'Urgente' ? 'Urgente' : 'Activo'
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximas audiencias',
      error: error.message
    });
  }
};

// Obtener actividad reciente
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await Activity.findAll({
      include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    const icons = {
      'case_created': 'briefcase',
      'case_updated': 'briefcase',
      'case_closed': 'check',
      'hearing_scheduled': 'gavel',
      'hearing_completed': 'gavel',
      'document_uploaded': 'file',
      'document_deleted': 'trash',
      'time_entry_added': 'clock',
      'client_added': 'users',
      'lawyer_added': 'users',
      'user_login': 'user',
      'user_logout': 'user'
    };

    const colors = {
      'case_created': '#5b8dee',
      'case_updated': '#5b8dee',
      'case_closed': '#4caf7d',
      'hearing_scheduled': '#e05555',
      'hearing_completed': '#4caf7d',
      'document_uploaded': '#5b8dee',
      'document_deleted': '#e05555',
      'time_entry_added': '#c9a84c',
      'client_added': '#b06bd4',
      'lawyer_added': '#b06bd4',
      'user_login': '#70708a',
      'user_logout': '#70708a'
    };

    const result = activities.map(a => ({
      id: a.id,
      icon: icons[a.type] || 'info',
      text: a.description,
      time: formatTimeAgo(a.createdAt),
      color: colors[a.type] || '#9090a8',
      user: a.user?.name || 'Sistema'
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: error.message
    });
  }
};

// Obtener resumen completo del dashboard
exports.getFullDashboard = async (req, res) => {
  try {
    // Obtener todo en paralelo para mejor rendimiento
    const [stats, casesByCategory, monthlyHours, recentCases, upcomingHearings, recentActivity] = await Promise.all([
      getStatsData(),
      getCasesByCategoryData(),
      getMonthlyHoursData(),
      getRecentCasesData(5),
      getUpcomingHearingsData(5),
      getRecentActivityData(5)
    ]);

    res.json({
      success: true,
      data: {
        stats,
        casesByCategory,
        monthlyHours,
        recentCases,
        upcomingHearings,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
};

// Funciones auxiliares
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 172800) return 'Ayer';
  return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

async function getStatsData() {
  const totalCases = await Case.count({ where: { status: { [Op.ne]: 'Archivado' } } });
  const activeCases = await Case.count({
    where: { status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente', 'Apelación'] } }
  });
  const totalLawyers = await Lawyer.count({ where: { status: 'Activo' } });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyHours = await TimeEntry.sum('hours', {
    where: { date: { [Op.gte]: startOfMonth }, isBillable: true }
  }) || 0;

  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  const upcomingHearings = await Hearing.count({
    where: {
      date: { [Op.between]: [new Date(), next7Days] },
      status: { [Op.in]: ['Programada', 'Urgente'] }
    }
  });

  return {
    cases: totalCases,
    activeCases,
    hours: parseFloat(monthlyHours.toFixed(0)),
    lawyers: totalLawyers,
    hearings: upcomingHearings
  };
}

async function getCasesByCategoryData() {
  const distribution = await Case.findAll({
    attributes: ['category', [Case.sequelize.fn('COUNT', '*'), 'value']],
    where: { status: { [Op.ne]: 'Archivado' } },
    group: ['category'],
    raw: true
  });

  const colors = {
    'Civil': '#c9a84c', 'Penal': '#e05555', 'Mercantil': '#5b8dee',
    'Laboral': '#4caf7d', 'Familiar': '#b06bd4', 'Fiscal': '#f5a623'
  };

  return distribution.map(d => ({
    name: d.category,
    value: parseInt(d.value),
    color: colors[d.category] || '#9090a8'
  }));
}

async function getMonthlyHoursData(target = 350) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({ year: date.getFullYear(), month: date.getMonth() + 1, name: date.toLocaleString('es-MX', { month: 'short' }) });
  }

  return Promise.all(months.map(async (m) => {
    const startDate = new Date(m.year, m.month - 1, 1);
    const endDate = new Date(m.year, m.month, 0);
    const hours = await TimeEntry.sum('hours', {
      where: { date: { [Op.between]: [startDate, endDate] }, isBillable: true }
    }) || 0;

    return { mes: m.name.charAt(0).toUpperCase() + m.name.slice(1), horas: parseFloat(hours.toFixed(0)), meta: target };
  }));
}

async function getRecentCasesData(limit) {
  return Case.findAll({
    include: [
      { model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] },
      { model: require('../models').Judge, as: 'judge', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });
}

async function getUpcomingHearingsData(limit) {
  const hearings = await Hearing.findAll({
    where: { date: { [Op.gte]: new Date() }, status: { [Op.in]: ['Programada', 'Urgente'] } },
    include: [
      { model: Case, as: 'case', attributes: ['id', 'caseNumber', 'name'] },
      { model: require('../models').Tribunal, as: 'tribunal', attributes: ['id', 'name'] }
    ],
    order: [['date', 'ASC'], ['time', 'ASC']],
    limit
  });

  return hearings.map(h => ({
    date: new Date(h.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    time: h.time?.slice(0, 5) || '',
    case: h.case?.name || '',
    tribunal: h.tribunal?.name || '',
    type: h.status
  }));
}

async function getRecentActivityData(limit) {
  const activities = await Activity.findAll({
    order: [['createdAt', 'DESC']],
    limit
  });

  const icons = { 'hearing_scheduled': 'gavel', 'document_uploaded': 'file', 'time_entry_added': 'clock', 'case_closed': 'check', 'client_added': 'users' };
  const colors = { 'hearing_scheduled': '#e05555', 'document_uploaded': '#5b8dee', 'time_entry_added': '#c9a84c', 'case_closed': '#4caf7d', 'client_added': '#b06bd4' };

  return activities.map(a => ({
    icon: icons[a.type] || 'info',
    text: a.description,
    time: formatTimeAgo(a.createdAt),
    color: colors[a.type] || '#9090a8'
  }));
}
