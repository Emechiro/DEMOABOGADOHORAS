# LexFirm Backend API

Backend API para el sistema de gestión de despacho de abogados LexFirm.

## Tecnologías

- **Node.js** + **Express** - Framework del servidor
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos (fácil de usar, sin configuración externa)
- **JWT** - Autenticación con tokens
- **Multer** - Manejo de subida de archivos

## Instalación

```bash
cd backend
npm install
```

## Configuración

El archivo `.env` ya está configurado con valores por defecto. Puedes modificarlo según necesites:

```env
PORT=3001
JWT_SECRET=lexfirm_secret_key_2025_muy_seguro
JWT_EXPIRES_IN=24h
```

## Inicializar Base de Datos

Ejecutar el seed para crear datos de prueba:

```bash
npm run seed
```

## Ejecutar

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: http://localhost:3001

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@lexfirm.com | admin123 | Administrador |
| v.torres@lexfirm.com | lawyer123 | Abogado |
| asistente@lexfirm.com | asist123 | Asistente |

## Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/password` - Cambiar contraseña

### Dashboard
- `GET /api/dashboard` - Dashboard completo
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/monthly-hours` - Horas mensuales

### Abogados
- `GET /api/lawyers` - Listar abogados
- `GET /api/lawyers/:id` - Obtener abogado
- `GET /api/lawyers/:id/cases` - Casos del abogado
- `GET /api/lawyers/:id/time-entries` - Horas del abogado
- `POST /api/lawyers` - Crear abogado
- `PUT /api/lawyers/:id` - Actualizar abogado
- `DELETE /api/lawyers/:id` - Eliminar abogado

### Casos
- `GET /api/cases` - Listar casos (con filtros)
- `GET /api/cases/:id` - Obtener caso
- `GET /api/cases/stats` - Estadísticas de casos
- `POST /api/cases` - Crear caso
- `PUT /api/cases/:id` - Actualizar caso
- `DELETE /api/cases/:id` - Archivar caso

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Entradas de Tiempo
- `GET /api/time-entries` - Listar entradas
- `GET /api/time-entries/monthly-summary` - Resumen mensual
- `POST /api/time-entries` - Crear entrada
- `PUT /api/time-entries/:id` - Actualizar entrada
- `PUT /api/time-entries/:id/approve` - Aprobar entrada
- `DELETE /api/time-entries/:id` - Eliminar entrada

### Audiencias
- `GET /api/hearings` - Listar audiencias
- `GET /api/hearings/upcoming` - Próximas audiencias
- `GET /api/hearings/calendar` - Calendario
- `POST /api/hearings` - Crear audiencia
- `PUT /api/hearings/:id` - Actualizar audiencia
- `DELETE /api/hearings/:id` - Eliminar audiencia

### Documentos
- `GET /api/documents` - Listar documentos
- `GET /api/documents/:id` - Obtener documento
- `GET /api/documents/:id/download` - Descargar documento
- `POST /api/documents` - Subir documento
- `POST /api/documents/multiple` - Subir múltiples
- `PUT /api/documents/:id` - Actualizar metadata
- `DELETE /api/documents/:id` - Eliminar documento

### Tribunales y Jueces
- `GET /api/tribunals` - Listar tribunales
- `GET /api/tribunals/:id` - Obtener tribunal
- `POST /api/tribunals` - Crear tribunal
- `GET /api/tribunals/judges/all` - Listar jueces
- `POST /api/tribunals/judges` - Crear juez

## Autenticación

Todas las rutas (excepto login y register) requieren autenticación.

Incluir el token en el header:
```
Authorization: Bearer <token>
```

## Ejemplo de Uso

```javascript
// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@lexfirm.com',
    password: 'admin123'
  })
});

const { data } = await response.json();
const token = data.token;

// Obtener casos
const cases = await fetch('http://localhost:3001/api/cases', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # Configuración de Sequelize
│   ├── controllers/         # Lógica de negocio
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   ├── lawyerController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js          # Autenticación JWT
│   │   └── upload.js        # Subida de archivos
│   ├── models/              # Modelos de Sequelize
│   │   ├── User.js
│   │   ├── Case.js
│   │   ├── Lawyer.js
│   │   └── ...
│   ├── routes/              # Definición de rutas
│   │   ├── auth.js
│   │   ├── cases.js
│   │   └── ...
│   └── server.js            # Punto de entrada
├── seeds/
│   └── seed.js              # Datos iniciales
├── uploads/                 # Archivos subidos
├── .env                     # Variables de entorno
└── package.json
```
