# Calendario — SecurePlan Mobile

**Actividad de Móvil** — Proyecto Integrador: SecurePlan Mobile
**Asignatura:** Desarrollo Móvil Integral

Aplicación móvil de gestión de tiempo y productividad (agenda) construida con una
arquitectura desacoplada (**Frontend Móvil + Backend API**). El proyecto aplica patrones
de diseño de software, principios de codificación segura para mitigar las vulnerabilidades
más comunes en entornos móviles y una gestión del flujo de trabajo apoyada en metodologías ágiles.

---

## Objetivo

Diseñar, codificar y defender una aplicación móvil de agenda que cumpla con:

- Separación limpia entre Frontend y Backend.
- Implementación de patrones de diseño (Singleton, Strategy, Observer).
- Codificación segura (hashing fuerte, almacenamiento cifrado, mitigación de IDOR e inyecciones).
- Flujo completo de autenticación y operaciones CRUD.
- Pruebas unitarias y principios SOLID.

---

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js + Express |
| Base de Datos | PostgreSQL (Docker en desarrollo) |
| Frontend Móvil | React Native + Expo |
| Seguridad | bcrypt, JWT, Expo SecureStore |
| Gestión | Jira / Trello + GitHub |

---

## Arquitectura

```
Calendario/
├── backend/    # API REST (Node + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/       # Entorno y conexión a BD (patrón Singleton)
│   │   ├── controllers/  # Lógica de los endpoints
│   │   ├── middleware/   # Autenticación y manejo de errores
│   │   ├── models/       # Acceso a datos y hashing
│   │   ├── routes/       # Definición de rutas
│   │   └── services/     # Servicios (JWT)
│   ├── sql/             # Esquema de base de datos
│   └── docker-compose.yml
└── frontend/   # App móvil (React Native + Expo)
    └── src/
        ├── domain/       # Entidades de dominio
        ├── data/         # Cliente HTTP y repositorios
        ├── navigation/   # Navegación protegida (pilas auth / no auth)
        ├── presentation/ # Pantallas, componentes y contexto
        └── services/     # Almacenamiento seguro
```

---

## Plan de Sprints

### Sprint 1 — Base Móvil, Arquitectura y Autenticación Segura
- **Backend:** conexión a BD con patrón **Singleton**, módulo de usuarios con cifrado asíncrono
  (bcrypt/Argon2) y generación de tokens **JWT** firmados.
- **Frontend:** arquitectura limpia de directorios, navegación protegida (pilas separadas para
  autenticados/no autenticados) y formularios de Login/Registro.
- **Seguridad:** prohibido el texto plano en BD y el JWT en almacenamiento común; se usa
  **Expo SecureStore**.

### Sprint 2 — Core de la Agenda (Módulo de Eventos)
- **Backend:** endpoints CRUD de eventos protegidos por middleware (título, descripción, fecha,
  hora, categoría, prioridad) con validación estricta mediante esquemas.
- **Frontend:** vista principal con componente de calendario e interceptores HTTP globales que
  adjuntan el JWT automáticamente.
- **Seguridad:** mitigación de vulnerabilidades **IDOR** (un usuario no puede acceder a eventos
  de otro).

### Sprint 3 — Patrones Avanzados y Capacidades del Dispositivo
- **Backend:** patrón **Strategy** para exportación de datos (JSON / CSV).
- **Frontend:** patrón **Observer** para alertas locales y uso del API nativo de
  **Notificaciones Locales**.
- **Seguridad:** manejador global de excepciones en el frontend y sin fuga de stack traces en el backend.

### Sprint 4 — Pruebas Unitarias, Refactorización y Auditoría
- Cobertura de pruebas unitarias (Jest / PyTest) sobre autenticación y fechas.
- Refactorización bajo principios **SOLID**.
- Auditoría de dependencias (`npm audit`, Snyk) y cierre del marco ágil.

---

## Roles del Equipo

- **Lead Backend & Security Engineer**
- **Lead Frontend Mobile Developer**
- **UI/UX & Mobile Developer**
- **DevSecOps & QA Engineer (Scrum Master)**
- **Fullstack Support & Sync Integrator**

---

## Cómo ejecutar el proyecto

### Requisitos
- Node.js 18+
- Docker y Docker Compose
- App Expo Go en un dispositivo o un emulador

### Backend

```bash
cd backend
cp .env.example .env
docker compose up -d      # levanta PostgreSQL
npm install
npm run dev               # servidor en http://localhost:4000
```

Endpoints disponibles:
- `GET  /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me` (protegido con Bearer Token)

### Frontend

```bash
cd frontend
cp .env.example .env      # configura EXPO_PUBLIC_API_URL
npm install
npm start
```

Para probar desde un dispositivo físico, ajusta `EXPO_PUBLIC_API_URL` a la IP de la máquina
donde corre el servidor (por ejemplo `http://192.168.1.10:4000`).

---

## Codificación Segura

- Contraseñas cifradas con **bcrypt** (nunca en texto plano).
- Tokens **JWT** almacenados con **Expo SecureStore** (Keychain / Keystore).
- Consultas SQL parametrizadas para prevenir inyecciones.
- Validación estricta de datos en el servidor.
- Mitigación de **IDOR** y manejo controlado de errores.

---

## Metodología y Control de Versiones

- Tablero Scrum (Jira / Trello) con historias de usuario.
- Uso de ramas y **Pull Requests** aprobadas (sin pushes directos a `main`).
- Repositorio GitHub con historial de commits por integrante.
