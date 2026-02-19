const jwt = require('jsonwebtoken');
const { User, Activity } = require('../models');
require('dotenv').config();

// Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone, avatar } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'viewer',
      phone,
      avatar
    });

    // Registrar actividad
    await Activity.create({
      userId: user.id,
      type: 'user_login',
      entityType: 'User',
      entityId: user.id,
      description: `Nuevo usuario registrado: ${user.name}`,
      ipAddress: req.ip
    });

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Registrar actividad
    await Activity.create({
      userId: user.id,
      type: 'user_login',
      entityType: 'User',
      entityId: user.id,
      description: `Usuario inició sesión: ${user.name}`,
      ipAddress: req.ip
    });

    // Generar token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Obtener perfil actual
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verificar contraseña actual
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

// Logout (opcional, principalmente para registrar actividad)
exports.logout = async (req, res) => {
  try {
    // Registrar actividad
    await Activity.create({
      userId: req.user.id,
      type: 'user_logout',
      entityType: 'User',
      entityId: req.user.id,
      description: `Usuario cerró sesión: ${req.user.name}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
};
