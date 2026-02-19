/**
 * Script de Seed - Datos iniciales para LexFirm
 * Ejecutar con: npm run seed
 */

const { sequelize, User, Lawyer, Client, Tribunal, Judge, Case, TimeEntry, Hearing, Document, Activity } = require('../src/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // Sincronizar base de datos (esto eliminará los datos existentes)
    await sequelize.sync({ force: true });
    console.log('✓ Base de datos sincronizada\n');

    // =====================
    // USUARIOS
    // =====================
    console.log('📝 Creando usuarios...');
    const users = await User.bulkCreate([
      { email: 'admin@lexfirm.com', password: 'admin123', name: 'Dr. Alejandro Vargas', role: 'admin', phone: '+52 55 1000-0001', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { email: 'v.torres@lexfirm.com', password: 'lawyer123', name: 'Dra. Valentina Torres', role: 'abogado', phone: '+52 55 1234-5678', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { email: 'r.fuentes@lexfirm.com', password: 'lawyer123', name: 'Dr. Rodrigo Fuentes', role: 'abogado', phone: '+52 55 2345-6789', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { email: 'c.reyes@lexfirm.com', password: 'lawyer123', name: 'Lic. Camila Reyes', role: 'abogado', phone: '+52 55 3456-7890', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { email: 'a.molina@lexfirm.com', password: 'lawyer123', name: 'Dr. Andrés Molina', role: 'abogado', phone: '+52 55 4567-8901', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { email: 'i.mendoza@lexfirm.com', password: 'lawyer123', name: 'Lic. Isabela Mendoza', role: 'abogado', phone: '+52 55 5678-9012', avatar: 'https://randomuser.me/api/portraits/women/21.jpg' },
      { email: 'asistente@lexfirm.com', password: 'asist123', name: 'María García', role: 'asistente', phone: '+52 55 6789-0123', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    ], { individualHooks: true });
    console.log(`✓ ${users.length} usuarios creados\n`);

    // =====================
    // ABOGADOS
    // =====================
    console.log('⚖️ Creando abogados...');
    const lawyers = await Lawyer.bulkCreate([
      { userId: 2, name: 'Dra. Valentina Torres', title: 'Doctora', specialty: 'Derecho Civil', email: 'v.torres@lexfirm.com', phone: '+52 55 1234-5678', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'Activo', hourlyRate: 2500, hireDate: '2020-01-15' },
      { userId: 3, name: 'Dr. Rodrigo Fuentes', title: 'Doctor', specialty: 'Derecho Penal', email: 'r.fuentes@lexfirm.com', phone: '+52 55 2345-6789', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'Activo', hourlyRate: 3000, hireDate: '2019-06-01' },
      { userId: 4, name: 'Lic. Camila Reyes', title: 'Licenciada', specialty: 'Derecho Mercantil', email: 'c.reyes@lexfirm.com', phone: '+52 55 3456-7890', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', status: 'Activo', hourlyRate: 2800, hireDate: '2021-03-20' },
      { userId: 5, name: 'Dr. Andrés Molina', title: 'Doctor', specialty: 'Derecho Laboral', email: 'a.molina@lexfirm.com', phone: '+52 55 4567-8901', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', status: 'Licencia', hourlyRate: 2200, hireDate: '2018-09-10' },
      { userId: 6, name: 'Lic. Isabela Mendoza', title: 'Licenciada', specialty: 'Derecho Familiar', email: 'i.mendoza@lexfirm.com', phone: '+52 55 5678-9012', avatar: 'https://randomuser.me/api/portraits/women/21.jpg', status: 'Activo', hourlyRate: 2400, hireDate: '2022-01-10' },
    ]);
    console.log(`✓ ${lawyers.length} abogados creados\n`);

    // =====================
    // CLIENTES
    // =====================
    console.log('👥 Creando clientes...');
    const clients = await Client.bulkCreate([
      { name: 'Miguel González', type: 'Persona Física', rfc: 'GORM850123ABC', email: 'miguel.gonzalez@email.com', phone: '+52 55 1111-1111', address: 'Av. Reforma 123, CDMX' },
      { name: 'Grupo Horizonte S.A.', type: 'Persona Moral', rfc: 'GHO200501XYZ', email: 'contacto@grupohorizonte.mx', phone: '+52 55 2222-2222', address: 'Paseo de la Reforma 500, CDMX', contactPerson: 'Roberto Sánchez' },
      { name: 'Eduardo Ramírez Ochoa', type: 'Persona Física', rfc: 'RAOE900315DEF', email: 'e.ramirez@email.com', phone: '+52 55 3333-3333', address: 'Col. Roma Norte, CDMX' },
      { name: 'Ana Herrera', type: 'Persona Física', rfc: 'HEAA880720GHI', email: 'ana.herrera@email.com', phone: '+52 55 4444-4444', address: 'Col. Condesa, CDMX' },
      { name: 'Pedro López', type: 'Persona Física', rfc: 'LOPP750505JKL', email: 'pedro.lopez@email.com', phone: '+52 55 5555-5555', address: 'Col. Del Valle, CDMX' },
      { name: 'Familia Mora', type: 'Persona Física', rfc: 'MOFA600101MNO', email: 'familia.mora@email.com', phone: '+52 55 6666-6666', address: 'Coyoacán, CDMX' },
      { name: 'TechMX Group', type: 'Persona Moral', rfc: 'TMG210801PQR', email: 'legal@techmx.com', phone: '+52 55 7777-7777', address: 'Santa Fe, CDMX', contactPerson: 'Carlos Mendez' },
    ]);
    console.log(`✓ ${clients.length} clientes creados\n`);

    // =====================
    // TRIBUNALES
    // =====================
    console.log('🏛️ Creando tribunales...');
    const tribunals = await Tribunal.bulkCreate([
      { name: '2° Tribunal Civil CDMX', type: 'Civil', jurisdiction: 'CDMX', address: 'Niños Héroes 123, Centro, CDMX', phone: '+52 55 5555-0001', schedule: 'Lun-Vie 9:00-15:00' },
      { name: 'Tribunal Fiscal Federal', type: 'Fiscal', jurisdiction: 'Federal', address: 'Insurgentes Sur 881, CDMX', phone: '+52 55 5555-0002', schedule: 'Lun-Vie 9:00-14:00' },
      { name: 'Juzgado Penal Norte', type: 'Penal', jurisdiction: 'CDMX Norte', address: 'Eje Central 456, CDMX', phone: '+52 55 5555-0003', schedule: 'Lun-Vie 9:00-17:00' },
      { name: 'Tribunal Familiar CDMX', type: 'Familiar', jurisdiction: 'CDMX', address: 'Fray Servando 789, CDMX', phone: '+52 55 5555-0004', schedule: 'Lun-Vie 9:00-15:00' },
      { name: 'Junta Local de Conciliación', type: 'Laboral', jurisdiction: 'CDMX', address: 'Dr. Vertiz 321, CDMX', phone: '+52 55 5555-0005', schedule: 'Lun-Vie 8:00-14:00' },
      { name: 'Notaría Pública 42', type: 'Otro', jurisdiction: 'CDMX', address: 'Av. Universidad 654, CDMX', phone: '+52 55 5555-0006', schedule: 'Lun-Vie 10:00-18:00' },
      { name: 'COFECE', type: 'Administrativo', jurisdiction: 'Federal', address: 'Av. Santa Fe 505, CDMX', phone: '+52 55 5555-0007', schedule: 'Lun-Vie 9:00-18:00' },
    ]);
    console.log(`✓ ${tribunals.length} tribunales creados\n`);

    // =====================
    // JUECES
    // =====================
    console.log('👨‍⚖️ Creando jueces...');
    const judges = await Judge.bulkCreate([
      { name: 'Marco Salinas', title: 'Juez', tribunalId: 1, specialty: 'Civil' },
      { name: 'Patricia Vidal', title: 'Jueza', tribunalId: 2, specialty: 'Fiscal' },
      { name: 'Carlos Ibáñez', title: 'Juez', tribunalId: 3, specialty: 'Penal' },
      { name: 'Sofía Blanco', title: 'Jueza', tribunalId: 4, specialty: 'Familiar' },
      { name: 'Luis Peña', title: 'Árbitro', tribunalId: 5, specialty: 'Laboral' },
      { name: 'Roberto Esperanza', title: 'Notario', tribunalId: 6, specialty: 'Civil' },
      { name: 'Alejandro Ríos', title: 'Comisionado', tribunalId: 7, specialty: 'Competencia Económica' },
    ]);
    console.log(`✓ ${judges.length} jueces creados\n`);

    // =====================
    // CASOS
    // =====================
    console.log('📁 Creando casos...');
    const cases = await Case.bulkCreate([
      { caseNumber: 'LEX-2025-001', name: 'González vs. Constructora Delta', clientId: 1, lawyerId: 1, tribunalId: 1, judgeId: 1, category: 'Civil', status: 'Activo', priority: 'Alta', startDate: '2025-01-12', estimatedHours: 100, billedHours: 47 },
      { caseNumber: 'LEX-2025-002', name: 'Caso Fiscal Grupo Horizonte', clientId: 2, lawyerId: 3, tribunalId: 2, judgeId: 2, category: 'Mercantil', status: 'Pendiente', priority: 'Media', startDate: '2025-01-20', estimatedHours: 80, billedHours: 23 },
      { caseNumber: 'LEX-2025-003', name: 'Estado vs. Ramírez Ochoa', clientId: 3, lawyerId: 2, tribunalId: 3, judgeId: 3, category: 'Penal', status: 'Urgente', priority: 'Urgente', startDate: '2025-02-03', estimatedHours: 120, billedHours: 68 },
      { caseNumber: 'LEX-2025-004', name: 'Divorcio Herrera-Castillo', clientId: 4, lawyerId: 5, tribunalId: 4, judgeId: 4, category: 'Familiar', status: 'Activo', priority: 'Media', startDate: '2025-02-14', estimatedHours: 60, billedHours: 31 },
      { caseNumber: 'LEX-2025-005', name: 'Despido Injustificado López', clientId: 5, lawyerId: 4, tribunalId: 5, judgeId: 5, category: 'Laboral', status: 'Apelación', priority: 'Media', startDate: '2025-01-08', estimatedHours: 90, billedHours: 55 },
      { caseNumber: 'LEX-2024-006', name: 'Sucesión Testamentaria Mora', clientId: 6, lawyerId: 1, tribunalId: 6, judgeId: 6, category: 'Civil', status: 'Cerrado', priority: 'Baja', startDate: '2024-11-10', endDate: '2025-01-15', estimatedHours: 40, billedHours: 28 },
      { caseNumber: 'LEX-2025-007', name: 'Fusión Empresarial TechMX', clientId: 7, lawyerId: 3, tribunalId: 7, judgeId: 7, category: 'Mercantil', status: 'Activo', priority: 'Alta', startDate: '2025-02-01', estimatedHours: 150, billedHours: 82 },
    ]);
    console.log(`✓ ${cases.length} casos creados\n`);

    // =====================
    // ENTRADAS DE TIEMPO
    // =====================
    console.log('⏱️ Creando entradas de tiempo...');
    const timeEntries = await TimeEntry.bulkCreate([
      { caseId: 3, lawyerId: 2, date: '2025-02-19', hours: 3.5, description: 'Revisión de expediente y preparación de defensa', activityType: 'Revisión de documentos', isBillable: true, hourlyRate: 3000, totalAmount: 10500 },
      { caseId: 7, lawyerId: 3, date: '2025-02-19', hours: 5.0, description: 'Due diligence y análisis regulatorio COFECE', activityType: 'Investigación', isBillable: true, hourlyRate: 2800, totalAmount: 14000 },
      { caseId: 1, lawyerId: 1, date: '2025-02-18', hours: 2.0, description: 'Llamada cliente y revisión de pruebas', activityType: 'Reunión con cliente', isBillable: false, hourlyRate: 2500, totalAmount: 0 },
      { caseId: 4, lawyerId: 5, date: '2025-02-18', hours: 1.5, description: 'Audiencia de mediación familiar', activityType: 'Audiencia', isBillable: true, hourlyRate: 2400, totalAmount: 3600 },
      { caseId: 2, lawyerId: 3, date: '2025-02-17', hours: 4.0, description: 'Preparación de alegatos y documentación fiscal', activityType: 'Redacción', isBillable: true, hourlyRate: 2800, totalAmount: 11200 },
      // Más entradas para estadísticas mensuales
      { caseId: 1, lawyerId: 1, date: '2025-01-15', hours: 6.0, description: 'Investigación de precedentes', activityType: 'Investigación', isBillable: true, hourlyRate: 2500, totalAmount: 15000 },
      { caseId: 2, lawyerId: 3, date: '2025-01-20', hours: 8.0, description: 'Análisis de estados financieros', activityType: 'Investigación', isBillable: true, hourlyRate: 2800, totalAmount: 22400 },
      { caseId: 3, lawyerId: 2, date: '2025-01-25', hours: 4.0, description: 'Preparación de testigos', activityType: 'Otro', isBillable: true, hourlyRate: 3000, totalAmount: 12000 },
    ]);
    console.log(`✓ ${timeEntries.length} entradas de tiempo creadas\n`);

    // =====================
    // AUDIENCIAS
    // =====================
    console.log('📅 Creando audiencias...');
    const hearings = await Hearing.bulkCreate([
      { caseId: 3, tribunalId: 3, judgeId: 3, date: '2025-02-21', time: '09:00', type: 'Audiencia de Pruebas', status: 'Urgente', location: 'Sala 3' },
      { caseId: 7, tribunalId: 7, judgeId: 7, date: '2025-02-25', time: '11:30', type: 'Comparecencia', status: 'Programada', location: 'Sala Principal' },
      { caseId: 1, tribunalId: 1, judgeId: 1, date: '2025-02-28', time: '10:00', type: 'Audiencia de Alegatos', status: 'Programada', location: 'Sala 1' },
      { caseId: 2, tribunalId: 2, judgeId: 2, date: '2025-03-05', time: '09:30', type: 'Audiencia Inicial', status: 'Programada', location: 'Sala Fiscal B' },
      { caseId: 4, tribunalId: 4, judgeId: 4, date: '2025-03-10', time: '12:00', type: 'Mediación', status: 'Programada', location: 'Sala de Mediación' },
      { caseId: 5, tribunalId: 5, judgeId: 5, date: '2025-03-15', time: '10:00', type: 'Audiencia de Apelación', status: 'Programada', location: 'Sala A' },
    ]);
    console.log(`✓ ${hearings.length} audiencias creadas\n`);

    // =====================
    // ACTIVIDAD
    // =====================
    console.log('📊 Creando actividad reciente...');
    const activities = await Activity.bulkCreate([
      { userId: 1, type: 'hearing_scheduled', entityType: 'Hearing', entityId: 1, description: 'Audiencia registrada: Estado vs. Ramírez' },
      { userId: 4, type: 'document_uploaded', entityType: 'Document', entityId: 1, description: 'Nuevo documento adjunto en LEX-2025-007' },
      { userId: 4, type: 'time_entry_added', entityType: 'TimeEntry', entityId: 2, description: '5h registradas — Lic. Camila Reyes' },
      { userId: 1, type: 'case_closed', entityType: 'Case', entityId: 6, description: 'Caso LEX-2024-006 marcado como Cerrado' },
      { userId: 1, type: 'client_added', entityType: 'Client', entityId: 7, description: 'Cliente TechMX Group añadido al sistema' },
    ]);
    console.log(`✓ ${activities.length} actividades creadas\n`);

    console.log('════════════════════════════════════════════');
    console.log('✅ Seed completado exitosamente!');
    console.log('════════════════════════════════════════════\n');
    console.log('Usuarios de prueba:');
    console.log('  • admin@lexfirm.com / admin123 (Administrador)');
    console.log('  • v.torres@lexfirm.com / lawyer123 (Abogado)');
    console.log('  • asistente@lexfirm.com / asist123 (Asistente)');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
};

seedDatabase();
