# Guía de Deploy — Hostinger Web Apps (sin VPS)

## Arquitectura de despliegue

```
Hostinger Web App (Node.js)
  └── /backend          ← NestJS sirve todo
        ├── /api/*      ← Endpoints REST
        └── /           ← React SPA estática (dist del frontend)
```

Un solo Web App sirve tanto el backend como el frontend construido.

---

## 1. Preparar la base de datos MySQL en Hostinger

1. Panel de Hostinger → **Hosting** → **Bases de datos** → **MySQL**
2. Crear base de datos: `auditmed_prod`
3. Crear usuario de base de datos con contraseña segura
4. Anotar:
   - Host (ej: `srv123.hostinger.com`)
   - Puerto: `3306`
   - Nombre de BD: `auditmed_prod`
   - Usuario
   - Contraseña

---

## 2. Preparar el proyecto localmente

### 2a. Construir el frontend

```bash
cd frontend
npm install
npm run build
# Genera: frontend/dist/
```

### 2b. Copiar el build del frontend al backend

```bash
# Desde la raíz del proyecto
cp -r frontend/dist backend/frontend/dist
```

> El NestJS está configurado para servir archivos estáticos desde `../frontend/dist`
> (relativo al directorio del backend).
>
> Estructura final del backend que se sube a Hostinger:
> ```
> backend/
>   src/
>   prisma/
>   frontend/dist/     ← Build del React aquí
>   package.json
>   dist/              ← Build del NestJS (generado por npm run build)
>   .env
> ```

### 2c. Crear el archivo `.env` en backend/

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:3306/auditmed_prod"
JWT_SECRET="un-secreto-largo-aleatorio-minimo-32-chars"
JWT_EXPIRES_IN="8h"
PORT=3000
NODE_ENV=production
CORS_ORIGIN="https://tu-dominio.com"
```

### 2d. Construir el backend

```bash
cd backend
npm install
npx prisma generate
npm run build
# Genera: backend/dist/
```

---

## 3. Subir a Hostinger Web Apps

### 3a. Crear la Web App en Hostinger

1. Panel → **Web Apps** → **+ Crear aplicación**
2. Seleccionar: **Node.js**
3. Configurar:
   - **Nombre**: auditmed
   - **Versión Node.js**: 20.x (LTS)
   - **Branch**: main (o la que uses)

### 3b. Configurar variables de entorno

En la Web App → **Variables de entorno**, agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/auditmed_prod` |
| `JWT_SECRET` | `secreto-largo-aleatorio` |
| `JWT_EXPIRES_IN` | `8h` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://tu-dominio.com` |

### 3c. Configurar Build y Start

En la Web App → **Configuración**:

**Build command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start command:**
```bash
npm run start:prod
```

**Root directory:** `backend`

> Si subes el proyecto completo (con frontend/), el root directory debe ser `backend`.
> Si subes solo el contenido de `backend/`, deja el root en `.`

---

## 4. Ejecutar migraciones y seed (primera vez)

Hostinger Web Apps tiene acceso SSH. Una vez desplegado:

```bash
# Acceder por SSH al Web App
cd /home/usuario/htdocs/tu-app/backend

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed (crea admin, roles, formulario inicial)
npm run seed
```

> Credenciales creadas por el seed:
> - **Usuario**: `admin`
> - **Contraseña**: `Admin1234!`

---

## 5. Verificar el deploy

```bash
# Health check
curl https://tu-dominio.com/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}

# Test de login
curl -X POST https://tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234!"}'
```

---

## 6. Configurar dominio

1. Panel Hostinger → **Dominios** → **DNS**
2. Apuntar el dominio al Web App:
   - Tipo: `A`
   - Nombre: `@` (o subdominio)
   - Valor: IP del Web App (se ve en la configuración de la Web App)
3. Esperar propagación DNS (hasta 24h, usualmente minutos en Hostinger)

---

## 7. Resumen de comandos del ciclo completo

```bash
# ── PRIMERA VEZ ──────────────────────────────────────────────────────────────

# 1. Clonar / subir el proyecto a Hostinger

# 2. En el servidor (SSH):
cd backend
npm install
npx prisma generate
npx prisma migrate deploy   # Crea todas las tablas
npm run seed                # Crea admin, roles, datos iniciales
npm run build
npm run start:prod

# ── ACTUALIZACIONES SIGUIENTES ───────────────────────────────────────────────

cd backend
npm install
npx prisma generate
npx prisma migrate deploy   # Solo aplica migraciones nuevas
npm run build
# Hostinger reinicia automáticamente

# ── DESARROLLO LOCAL ─────────────────────────────────────────────────────────

# Terminal 1 - Backend:
cd backend
cp .env.example .env        # Configurar con MySQL local
npm install
npx prisma generate
npx prisma migrate dev      # Crea tablas en local
npm run seed
npm run start:dev

# Terminal 2 - Frontend:
cd frontend
npm install
npm run dev                 # Puerto 5173 con proxy a localhost:3000
```

---

## 8. Estructura final del proyecto

```
auditmed-nestjs/
├── backend/
│   ├── src/
│   │   ├── auth/           JWT, login, me
│   │   ├── users/          CRUD usuarios
│   │   ├── roles/          Roles + permisos
│   │   ├── forms/          Templates de auditoría
│   │   ├── audits/         Casos de auditoría
│   │   ├── master/         Unidades ejecutoras
│   │   ├── prisma/         PrismaService
│   │   ├── common/         Guards, decorators, filters
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma   Modelos MySQL
│   │   └── seed.ts         Datos iniciales
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/            cliente Axios
    │   ├── auth/           AuthContext
    │   ├── hooks/          useAuth
    │   ├── layouts/        MainLayout
    │   ├── routes/         PrivateRoute
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── audits/     AuditList, AuditForm
    │       ├── forms/      FormList, FormBuilder
    │       └── admin/      UserList, RoleList, MasterData
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example

```

---

## 9. Endpoints API disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → access_token |
| GET  | `/api/auth/me` | Usuario autenticado |
| GET  | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear usuario |
| PUT  | `/api/users/:id` | Editar usuario |
| GET  | `/api/roles` | Listar roles |
| GET  | `/api/roles/permissions` | Todos los permisos |
| PUT  | `/api/roles/:id/permissions` | Actualizar permisos del rol |
| GET  | `/api/forms` | Listar formularios |
| GET  | `/api/forms/:id` | Obtener formulario completo |
| POST | `/api/forms` | Crear formulario |
| PUT  | `/api/forms/:id` | Actualizar formulario |
| PATCH | `/api/forms/:id/publish` | Publicar formulario |
| DELETE | `/api/forms/:id` | Desactivar formulario |
| GET  | `/api/audits` | Listar auditorías (paginado) |
| GET  | `/api/audits/stats` | Estadísticas |
| POST | `/api/audits` | Crear caso |
| PUT  | `/api/audits/:id` | Actualizar caso |
| PATCH | `/api/audits/:id/close` | Cerrar caso + calcular score |
| GET  | `/api/master/unidades-ejecutoras` | Listar unidades |
| POST | `/api/master/unidades-ejecutoras` | Crear unidad |
| GET  | `/health` | Health check |
