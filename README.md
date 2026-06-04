# SpaBar API

Backend REST para **SpaBar** — sistema gestor de bar/spa universitario.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT + bcrypt
- Zod (validaciones)
- Clean Architecture

## Arquitectura

```
src/
├── domain/          # Entidades e interfaces de repositorios
├── application/     # Casos de uso y DTOs (Zod)
├── infrastructure/  # Prisma, repos, servicios (JWT, bcrypt)
├── interfaces/      # Controllers, routes, middlewares
└── shared/          # Errores, tipos, utilidades
```

## Requisitos

- Node.js 20+
- PostgreSQL (local, Supabase, Render, etc.)

## Instalación

```bash
cp .env.example .env
# Editar DATABASE_URL y JWT_SECRET

npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API disponible en `http://localhost:4000/api/v1`

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 4000) |
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secreto para firmar JWT |
| `JWT_EXPIRES_IN` | Expiración access token (ej: `1d`) |
| `JWT_REFRESH_SECRET` | Secreto refresh token |
| `JWT_REFRESH_EXPIRES_IN` | Expiración refresh (ej: `7d`) |
| `FRONTEND_URL` | URL del frontend para CORS |

## Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ir a **Project Settings → Database → Connection string (URI)**
3. Copiar la URI en `DATABASE_URL` del `.env`
4. Ejecutar migraciones:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm start` | Ejecutar build |
| `npm run typecheck` | Verificar tipos |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Migraciones dev |
| `npm run prisma:deploy` | Migraciones producción |
| `npm run prisma:seed` | Datos iniciales |

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registro |
| POST | `/api/v1/auth/login` | Login (JWT) |
| POST | `/api/v1/auth/refresh` | Renovar token |
| CRUD | `/api/v1/products` | Productos/menú/inventario |
| CRUD | `/api/v1/orders` | Pedidos |
| CRUD | `/api/v1/users` | Usuarios (admin) |
| CRUD | `/api/v1/tables` | Mesas |
| CRUD | `/api/v1/reservations` | Reservas |

## Credenciales seed

| Rol | Email | Contraseña | Cargo |
|-----|-------|------------|-------|
| Admin | `admin@spabar.com` | `Admin123!` | Gerente General |
| Empleado | `carlos@spabar.com` | `Employee123!` | Jefe de Barra |
| Empleado | `sofia@spabar.com` | `Employee123!` | Camarera |
| Empleado | `jorge@spabar.com` | `Employee123!` | Cocina |
| Empleado | `ana@spabar.com` | `Employee123!` | Hostess |
| Empleado | `miguel@spabar.com` | `Employee123!` | Bartender |
| Empleado | `laura@spabar.com` | `Employee123!` | Camarera |
| Empleado | `diego@spabar.com` | `Employee123!` | Seguridad |

## Despliegue en Render

1. Conectar repositorio GitHub
2. Usar `render.yaml` incluido o configurar manualmente:
   - **Build:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start:** `npm start`
3. Configurar variables de entorno
4. Usar PostgreSQL de Supabase como `DATABASE_URL`

## Formato de respuesta

```json
{
  "success": true,
  "message": "Descripción",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```
