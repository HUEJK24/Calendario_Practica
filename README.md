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
| Frontend Móvil | React Native + Expo (SDK 58) |
| Build nativo | Android SDK 36, NDK 27, Gradle 9.4 (APK sin Expo Go) |
| Seguridad | bcrypt, JWT, Expo SecureStore |
| Pruebas | Jest, Supertest, jest-expo |
| Despliegue | Render (backend + PostgreSQL) |
| Gestión | Jira / Trello + GitHub |

---

## Arquitectura

```
Calendario/
├── backend/                 # API REST (Node + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/          # Entorno y conexión a BD (patrón Singleton)
│   │   │   └── __mocks__/   # Mock de la BD para pruebas (Sprint 4)
│   │   ├── controllers/     # Lógica de los endpoints
│   │   ├── middleware/      # Autenticación y manejo de errores
│   │   ├── models/          # Acceso a datos y hashing
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/
│   │   │   └── export/      # Patrón Strategy (JSON / CSV)
│   │   └── validators/      # Esquemas de validación de entrada (Zod)
│   ├── sql/                 # Esquema de base de datos
│   ├── jest.config.js       # Infraestructura de pruebas (Sprint 4)
│   └── docker-compose.yml
└── frontend/                # App móvil (React Native + Expo)
    ├── app.json             # Config nativa: package, versionCode, iconos
    ├── jest.config.js       # Infraestructura de pruebas (Sprint 4)
    └── src/
        ├── domain/          # Entidades, constantes y utilidades
        │   └── observers/   # EventBus (Sujeto del patrón Observer)
        ├── data/            # Cliente HTTP y repositorios
        ├── navigation/      # Navegación protegida (pilas auth / no auth)
        ├── presentation/
        │   ├── components/  # Componentes reutilizables + ErrorBoundary
        │   ├── context/      # EventsContext (Sujeto del Observer)
        │   ├── observers/    # EventReminderObserver
        │   └── screens/      # Pantallas
        ├── services/        # secureStorage, notifications, errorHandler
        └── theme/           # Tokens visuales
```

---

## Plan de Sprints

### Sprint 1 — Base Móvil, Arquitectura y Autenticación Segura
- **Backend:** conexión a BD con patrón **Singleton**, módulo de usuarios con cifrado asíncrono
  (**bcrypt**) y generación de tokens **JWT** firmados.
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
- **Backend:** patrón **Strategy** para exportación de datos (JSON / CSV), con validación del
  formato y neutralización de inyección de fórmulas en CSV.
- **Frontend:** patrón **Observer** (EventBus + EventReminderObserver) y **Notificaciones
  Locales** para recordatorios.
- **Seguridad:** manejador global de excepciones en el frontend y respuestas 5xx sin fuga de
  internos en el backend.

### Sprint 4 — Pruebas Unitarias, Refactorización y Auditoría
- Infraestructura de pruebas con **Jest** en backend (más **Supertest**) y **Jest + jest-expo**
  en frontend, con mock de la base de datos.
- Refactorización bajo principios **SOLID**.
- Auditoría de dependencias (`npm audit`) y cierre del marco ágil.

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
- Para desarrollo: **Expo Go** en un dispositivo o emulador
- Para compilar la APK: **JDK 17** y el **Android SDK** (build-tools 36, NDK 27, cmake 3.22)

### Backend

```bash
cd backend
docker compose up -d      # levanta PostgreSQL
npm install
npm run dev               # servidor en http://localhost:4000
```

Crea el archivo `backend/.env` con:

```
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=calendario
DB_PASSWORD=calendario
DB_NAME=calendario
JWT_SECRET=<cadena-secreta>
```

> En despliegue se usa `DATABASE_URL` en lugar de las variables `DB_*`; si existe,
> tiene prioridad y habilita SSL automáticamente.

Endpoints disponibles:
- `GET  /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me` (protegido con Bearer Token)
- `GET  /api/events` (protegido)
- `POST /api/events` (protegido)
- `GET  /api/events/:id` (protegido)
- `PUT  /api/events/:id` (protegido)
- `DELETE /api/events/:id` (protegido)
- `GET  /api/events/export?format=json|csv` (protegido) — exportación (Sprint 3)

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Crea el archivo `frontend/.env` con:

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

Para un dispositivo físico, ajusta `EXPO_PUBLIC_API_URL` a la IP de la máquina donde corre el
servidor (por ejemplo `http://192.168.1.10:4000`). Ambos dispositivos deben estar en la misma red.

### Pruebas

```bash
cd backend  && npm test   # Jest (backend)
cd frontend && npm test   # Jest + jest-expo (frontend)
```

La infraestructura está configurada (ver `jest.config.js` en cada proyecto); las suites de
pruebas se agregan en `tests/`. Las pruebas de backend usan un mock de la base de datos
(`src/config/__mocks__/database.js`), por lo que no requieren PostgreSQL.

---

## Compilar la APK (sin Expo Go)

```bash
cd frontend
echo "EXPO_PUBLIC_API_URL=https://<tu-backend>" > .env
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
```

El archivo resultante queda en
`android/app/build/outputs/apk/release/app-release.apk`, listo para instalar y compartir.

Consideraciones:

- `android.package` y `android.versionCode` se definen en `app.json`. Hay que subir el
  `versionCode` en cada versión nueva, o Android rechazará la actualización.
- `android/` e `ios/` **no se versionan**: los genera `prebuild` y por eso están en `.gitignore`.
- `EXPO_PUBLIC_API_URL` se incrusta en el bundle en tiempo de build: no se puede cambiar
  después de compilar, hay que recompilar.
- Android bloquea HTTP plano desde la versión 9, por lo que el backend debe exponerse en **HTTPS**.
- La firma de `release` usa el keystore de debug por plantilla: sirve para probar y compartir,
  no para publicar en Play Store.

---

## Despliegue del backend en Render

1. **Base de datos**: `New → PostgreSQL` y copiar la *Internal Database URL*.
2. **Esquema**: ejecutar `backend/sql/init.sql` desde *Data → PostgreSQL → Queries*.
3. **Servicio web**: `New → Web Service` con:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
4. **Variables de entorno**:
   - `NODE_ENV=production`
   - `JWT_SECRET` (obligatorio; el servidor se niega a arrancar en producción con el valor por defecto)
   - `DATABASE_URL` (añadir `?sslmode=require` si no viene incluido)
5. Compilar la APK apuntando `EXPO_PUBLIC_API_URL` a la URL pública generada.

---

## Codificación Segura

- Contraseñas cifradas con **bcrypt** (nunca en texto plano).
- Tokens **JWT** almacenados con **Expo SecureStore** (Keychain / Keystore).
- Consultas SQL parametrizadas para prevenir inyecciones.
- Validación estricta de datos en el servidor.
- Mitigación de **IDOR** y manejo controlado de errores.
- Los secretos y variables de entorno no se versionan (`.env` en `.gitignore`).

---

## Metodología y Control de Versiones

- Tablero Scrum (Jira / Trello) con historias de usuario.
- Uso de ramas y **Pull Requests** aprobadas (sin pushes directos a `main`).
- Repositorio GitHub con historial de commits por integrante.
