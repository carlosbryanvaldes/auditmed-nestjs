/**
 * AuditMed Pro — Prisma Seed (idempotente)
 * Ejecutar: npm run seed
 *
 * Crea:
 *  - Permisos base
 *  - Roles: administrador, gerencia_auditoria, auditor
 *  - Usuario admin (admin / Admin1234!)
 *  - Unidad ejecutora inicial
 *  - Formulario de ejemplo con secciones y campos
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Definimos los valores de enum como constantes para evitar dependencia
// del cliente generado (compatible con SQLite y MySQL)
const FieldType = {
  YES_NO: 'YES_NO',
  YES_NO_NA: 'YES_NO_NA',
  TEXT: 'TEXT',
  SCALE: 'SCALE',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  SINGLE_SELECT: 'SINGLE_SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  SIGNATURE: 'SIGNATURE',
  FILE: 'FILE',
} as const;

const FormStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

const prisma = new PrismaClient();

// ── Permisos ──────────────────────────────────────────────────────────────────
const PERMISSIONS = [
  // Usuarios
  { name: 'users:read',   description: 'Ver usuarios',          module: 'users' },
  { name: 'users:write',  description: 'Crear/editar usuarios', module: 'users' },
  { name: 'users:delete', description: 'Eliminar usuarios',     module: 'users' },
  // Roles
  { name: 'roles:read',   description: 'Ver roles',             module: 'roles' },
  { name: 'roles:write',  description: 'Gestionar roles',       module: 'roles' },
  // Formularios
  { name: 'forms:read',   description: 'Ver formularios',       module: 'forms' },
  { name: 'forms:write',  description: 'Crear/editar formularios', module: 'forms' },
  { name: 'forms:delete', description: 'Eliminar formularios',  module: 'forms' },
  // Auditorías
  { name: 'audits:read',  description: 'Ver auditorías',        module: 'audits' },
  { name: 'audits:write', description: 'Crear/editar auditorías', module: 'audits' },
  { name: 'audits:close', description: 'Cerrar auditorías',     module: 'audits' },
  { name: 'audits:delete', description: 'Eliminar auditorías',  module: 'audits' },
  // Maestros
  { name: 'master:read',  description: 'Ver datos maestros',    module: 'master' },
  { name: 'master:write', description: 'Gestionar datos maestros', module: 'master' },
  // Admin
  { name: 'admin:all',    description: 'Acceso total al sistema', module: 'admin' },
  // Bitácora de Internos
  { name: 'bitacora:read',     description: 'Ver bitácoras',                       module: 'bitacora' },
  { name: 'bitacora:write',    description: 'Crear y editar bitácoras',             module: 'bitacora' },
  { name: 'bitacora:close',    description: 'Cerrar turno de bitácora',             module: 'bitacora' },
  { name: 'bitacora:admin',    description: 'Administrar sedes y servicios',        module: 'bitacora' },
  { name: 'bitacora:historial',description: 'Ver historial completo del paciente',  module: 'bitacora' },
];

// ── Roles con sus permisos ────────────────────────────────────────────────────
const ROLES = [
  {
    name: 'administrador',
    description: 'Acceso completo al sistema',
    permissions: PERMISSIONS.map(p => p.name),
  },
  {
    name: 'gerencia_auditoria',
    description: 'Gestión de formularios y revisión de auditorías',
    permissions: [
      'users:read',
      'roles:read',
      'forms:read', 'forms:write',
      'audits:read', 'audits:write', 'audits:close',
      'master:read', 'master:write',
    ],
  },
  {
    name: 'auditor',
    description: 'Realización de auditorías médicas',
    permissions: [
      'forms:read',
      'audits:read', 'audits:write',
      'master:read',
    ],
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── 1. Permisos ─────────────────────────────────────────────────────────────
  console.log('  → Creando permisos...');
  const permMap: Record<string, number> = {};
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
    permMap[p.name] = p.id;
  }

  // ── 2. Roles y sus permisos ─────────────────────────────────────────────────
  console.log('  → Creando roles...');
  const roleMap: Record<string, number> = {};
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });
    roleMap[role.name] = role.id;

    // Asignar permisos idempotente
    for (const permName of roleDef.permissions) {
      const permId = permMap[permName];
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
  }

  // ── 3. Usuario admin ────────────────────────────────────────────────────────
  console.log('  → Creando usuario admin...');
  const adminRoleId = roleMap['administrador'];
  const passwordHash = await bcrypt.hash('Admin1234!', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@auditmed.local',
      passwordHash,
      fullName: 'Administrador del Sistema',
      status: 'ACTIVE',
      roleId: adminRoleId,
    },
  });

  // ── 4. Unidad ejecutora inicial ─────────────────────────────────────────────
  console.log('  → Creando unidad ejecutora...');
  await prisma.unidadEjecutora.upsert({
    where: { code: 'SEDE_PRINCIPAL' },
    update: {},
    create: {
      name: 'Sede Principal',
      code: 'SEDE_PRINCIPAL',
      isActive: true,
    },
  });

  // ── 5. Formulario de ejemplo ─────────────────────────────────────────────────
  console.log('  → Creando formulario de ejemplo...');
  const existing = await prisma.formTemplate.findFirst({
    where: { name: 'Auditoría de Historia Clínica' },
  });

  if (!existing) {
    await prisma.formTemplate.create({
      data: {
        name: 'Auditoría de Historia Clínica',
        description: 'Formulario estándar de auditoría de historia clínica',
        version: '1.0',
        formType: 'historia_clinica',
        status: FormStatus.PUBLISHED,
        isActive: true,
        isDefault: true,
        sections: {
          create: [
            {
              title: 'Identificación del Paciente',
              orderIndex: 0,
              weight: 1.0,
              fields: {
                create: [
                  { label: '¿La HC tiene datos completos de identificación?', fieldKey: 'identificacion_completa', fieldType: FieldType.YES_NO_NA, required: true, score: 1.0, sortOrder: 0 },
                  { label: '¿Fecha de ingreso registrada?', fieldKey: 'fecha_ingreso', fieldType: FieldType.YES_NO_NA, required: true, score: 1.0, sortOrder: 1 },
                  { label: '¿Diagnóstico principal registrado (CIE-10)?', fieldKey: 'diagnostico_cie10', fieldType: FieldType.YES_NO_NA, required: true, score: 1.0, sortOrder: 2 },
                ],
              },
            },
            {
              title: 'Historia Clínica',
              orderIndex: 1,
              weight: 2.0,
              fields: {
                create: [
                  { label: '¿Historia clínica completa y legible?', fieldKey: 'hc_completa', fieldType: FieldType.YES_NO_NA, required: true, score: 2.0, sortOrder: 0 },
                  { label: '¿Anamnesis documentada?', fieldKey: 'anamnesis', fieldType: FieldType.YES_NO_NA, required: true, score: 1.0, sortOrder: 1 },
                  { label: '¿Examen físico registrado?', fieldKey: 'examen_fisico', fieldType: FieldType.YES_NO_NA, required: true, score: 1.0, sortOrder: 2 },
                  { label: '¿Plan de manejo documentado?', fieldKey: 'plan_manejo', fieldType: FieldType.YES_NO_NA, required: true, score: 1.5, sortOrder: 3 },
                ],
              },
            },
            {
              title: 'Evoluciones y Seguimiento',
              orderIndex: 2,
              weight: 1.5,
              fields: {
                create: [
                  { label: '¿Evoluciones médicas diarias registradas?', fieldKey: 'evoluciones_diarias', fieldType: FieldType.YES_NO_NA, required: true, score: 2.0, sortOrder: 0 },
                  { label: '¿Notas de enfermería completas?', fieldKey: 'notas_enfermeria', fieldType: FieldType.YES_NO_NA, required: false, score: 1.0, sortOrder: 1 },
                  { label: '¿Interconsultas documentadas?', fieldKey: 'interconsultas', fieldType: FieldType.YES_NO_NA, required: false, score: 1.0, sortOrder: 2 },
                ],
              },
            },
            {
              title: 'Egreso',
              orderIndex: 3,
              weight: 1.0,
              fields: {
                create: [
                  { label: '¿Nota de egreso documentada?', fieldKey: 'nota_egreso', fieldType: FieldType.YES_NO_NA, required: true, score: 2.0, sortOrder: 0 },
                  { label: '¿Condición de egreso registrada?', fieldKey: 'condicion_egreso', fieldType: FieldType.SINGLE_SELECT, required: true, score: 1.0, sortOrder: 1, hasObservation: true, options: { create: [ { label: 'Mejorado', value: 'mejorado', sortOrder: 0 }, { label: 'Estacionario', value: 'estacionario', sortOrder: 1 }, { label: 'Sin cambios', value: 'sin_cambios', sortOrder: 2 }, { label: 'Fallecido', value: 'fallecido', sortOrder: 3 }, ] } },
                  { label: 'Observaciones finales del auditor', fieldKey: 'observaciones_finales', fieldType: FieldType.TEXT, required: false, score: 0, sortOrder: 2, hasObservation: false },
                ],
              },
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seed completado exitosamente.');
  console.log('');
  console.log('  Credenciales de acceso:');
  console.log('  Usuario:    admin');
  console.log('  Contraseña: Admin1234!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
