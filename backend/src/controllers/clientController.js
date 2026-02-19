const { Client, Case, Lawyer } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los clientes
exports.getAll = async (req, res) => {
  try {
    const { type, search, isActive, page = 1, limit = 50 } = req.query;

    const where = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { rfc: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Client.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Agregar conteo de casos
    const clientsWithStats = await Promise.all(rows.map(async (client) => {
      const caseCount = await Case.count({ where: { clientId: client.id } });
      const activeCases = await Case.count({
        where: { clientId: client.id, status: { [Op.in]: ['Activo', 'Urgente', 'Pendiente'] } }
      });
      return { ...client.toJSON(), caseCount, activeCases };
    }));

    res.json({
      success: true,
      data: {
        clients: clientsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// Obtener un cliente por ID
exports.getById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{
        model: Case, as: 'cases',
        include: [{ model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] }],
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

// Crear cliente
exports.create = async (req, res) => {
  try {
    const { name, type, rfc, email, phone, address, contactPerson, notes } = req.body;

    // Verificar RFC único si se proporciona
    if (rfc) {
      const existing = await Client.findOne({ where: { rfc } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese RFC'
        });
      }
    }

    const client = await Client.create({
      name,
      type: type || 'Persona Física',
      rfc,
      email,
      phone,
      address,
      contactPerson,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: client
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

// Actualizar cliente
exports.update = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const { name, type, rfc, email, phone, address, contactPerson, notes, isActive } = req.body;

    // Verificar RFC único si cambió
    if (rfc && rfc !== client.rfc) {
      const existing = await Client.findOne({ where: { rfc } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese RFC'
        });
      }
    }

    await client.update({
      name: name || client.name,
      type: type || client.type,
      rfc: rfc !== undefined ? rfc : client.rfc,
      email: email !== undefined ? email : client.email,
      phone: phone !== undefined ? phone : client.phone,
      address: address !== undefined ? address : client.address,
      contactPerson: contactPerson !== undefined ? contactPerson : client.contactPerson,
      notes: notes !== undefined ? notes : client.notes,
      isActive: isActive !== undefined ? isActive : client.isActive
    });

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

// Eliminar cliente
exports.delete = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar si tiene casos
    const caseCount = await Case.count({ where: { clientId: client.id } });
    if (caseCount > 0) {
      // Soft delete
      await client.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Cliente desactivado (tiene casos asociados)'
      });
    }

    await client.destroy();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

// Obtener casos de un cliente
exports.getCases = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = { clientId: req.params.id };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await Case.findAndCountAll({
      where,
      include: [
        { model: Lawyer, as: 'lawyer', attributes: ['id', 'name', 'avatar'] }
      ],
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
      message: 'Error al obtener casos del cliente',
      error: error.message
    });
  }
};
