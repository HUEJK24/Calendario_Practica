# QA local de SecurePlan Mobile

Guía completa para el responsable de QA: `qa/Guia_QA_Sprint_Final_Jose_Manuel_Mandujano.pdf`.

Carpeta para probar la API a mano y por script. No forma parte del entregable: `qa/` no está en `.gitignore`, así que agrega esa línea si no quieres versionarla.

## 1. Antes de probar

```bash
cd backend
docker compose up -d
npm run dev
curl http://localhost:4000/health
```

`sql/init.sql` se aplica solo la primera vez que se crea el volumen. Si el contenedor arrancó con la base vacía:

```bash
docker compose down -v
docker compose up -d
```

## 2. Peticiones manuales

### Postman

1. Importa `qa/postman/SecurePlan-QA.postman_collection.json`.
2. Importa `qa/postman/SecurePlan-QA.postman_environment.json`.
3. Selecciona el entorno **SecurePlan QA Local**.
4. Ejecuta las carpetas en orden: Salud, Autenticación, Eventos, Exportación, Seguridad.

La colección guarda `token` y `eventId` en variables después de cada request, así que el resto corre sin pegar nada. `otherEventId` se llena a mano: registra un segundo usuario, crea un evento con su token y pega ese id. La request de IDOR debe responder 404.

| Carpeta | Qué verifica |
| --- | --- |
| Salud | `GET /health` responde 200. |
| Autenticación | Registro 201 sin exponer la contraseña, duplicado 409, validaciones 400, login 200/401, `me` con y sin token. |
| Eventos | CRUD completo, 400 en id no numérico, 404 en id inexistente, 204 en borrado. |
| Exportación | JSON y CSV con cabecera correcta, formato inválido 400, sin token 401. |
| Seguridad | IDOR en lectura, campo extra rechazado por `.strict()`, fin anterior al inicio. |

### Otras herramientas

- **Insomnia** y **Thunder Client** (VS Code) importan la misma colección.
- **REST Client** (VS Code) sirve si prefieres archivos `.http` con las rutas y el token en texto.
- **curl** o **httpie** para una petición suelta.
- **Newman** corre la colección sin abrir Postman, útil para CI:

```bash
npx newman run qa/postman/SecurePlan-QA.postman_collection.json \
  -e qa/postman/SecurePlan-QA.postman_environment.json
```

### Endpoints

| Método | Ruta | Auth | Éxito |
| --- | --- | --- | --- |
| GET | `/health` | No | 200 |
| POST | `/api/auth/register` | No | 201 |
| POST | `/api/auth/login` | No | 200 |
| GET | `/api/auth/me` | Bearer | 200 |
| GET | `/api/events` | Bearer | 200 |
| POST | `/api/events` | Bearer | 201 |
| GET | `/api/events/:id` | Bearer | 200 |
| PUT | `/api/events/:id` | Bearer | 200 |
| DELETE | `/api/events/:id` | Bearer | 204 |
| GET | `/api/events/export?format=json\|csv` | Bearer | 200 |

### Ejemplos con curl

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa+1@example.com","password":"QaPassword123!"}'

TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa+1@example.com","password":"QaPassword123!"}' | jq -r .token)

curl -s -X POST http://localhost:4000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Reunión","date":"2026-12-01","startTime":"09:00","endTime":"10:00","category":"work","priority":"high"}'
```

`jq` es opcional; sin él, copia el token de la respuesta a mano.

## 3. Pruebas por script

```bash
node qa/scripts/smoke.mjs
```

El script no instala nada: usa `fetch` de Node 18 o superior. Requiere el backend arriba. Crea dos usuarios con correo único, corre los casos en secuencia y termina con el resumen.

Contra otro entorno:

```bash
QA_BASE_URL=https://mi-api.onrender.com node qa/scripts/smoke.mjs
```

Código de salida `0` si pasa todo y `1` si falla algo, así que sirve en CI o en un hook de pre-push.

| Bloque | Casos |
| --- | --- |
| Salud | `/health` responde `ok`. |
| Autenticación | Registro, duplicado, contraseña corta, correo inválido, login correcto e incorrecto, `me` con token válido, sin token y con token falso. |
| Eventos | Lista vacía inicial, creación, campos extra, orden de horas, fecha mal formada, categoría inválida, listado, lectura, id no numérico, id inexistente, actualización. |
| IDOR | Un segundo usuario recibe 404 al leer, actualizar y borrar el evento ajeno; el dueño sigue viéndolo. |
| Exportación | JSON y CSV con solo los eventos del dueño, formato inválido y parámetro extra. |
| Cierre | Borrado 204 sin cuerpo, segundo borrado 404, ruta inexistente 404. |

El script valida además que `date` llegue como `AAAA-MM-DD` y `startTime` como `HH:MM`, que es lo que espera el frontend.

## 4. Pruebas unitarias del repositorio

```bash
cd backend && npm test
cd frontend && npm test
```

El backend usa Jest + Supertest con `backend/tests/**/*.test.js` y mockea la base con `jest.mock('../src/config/database')`. El frontend usa Jest con `jest-expo`.

Hoy no hay archivos de prueba en el repo: `npx jest` termina con código 1 y el mensaje `No tests found`. Ese es el pendiente para cerrar el 3%.

## 5. Limpieza de datos

El script deja usuarios `qa+...@example.com` en la base. Los eventos se borran solos por `ON DELETE CASCADE`.

```bash
docker exec -i calendario-db psql -U calendario -d calendario < qa/scripts/cleanup.sql
```

En un entorno remoto:

```bash
psql "$DATABASE_URL" -f qa/scripts/cleanup.sql
```

## 6. Herramientas opcionales

- **k6** para carga: un script JS con `http.post` y umbrales de latencia.
- **OWASP ZAP** para un escaneo pasivo del backend o de la versión web.
- **Maestro** para E2E del APK con flujos YAML (registro, login, crear evento).
- **Playwright** si pruebas la versión web de Expo.

## 7. Checklist manual

- [ ] Registro con correo repetido responde 409 y no crea fila.
- [ ] La respuesta de registro y login nunca incluye `password`.
- [ ] Un token vencido o alterado responde 401 y la app borra la sesión.
- [ ] El usuario B no ve, edita ni borra eventos del usuario A.
- [ ] Un evento con `endTime <= startTime` no se guarda.
- [ ] La agenda agrupa el evento en la fecha correcta, sin corrimiento por zona horaria.
- [ ] El recordatorio se programa con la hora local del dispositivo.
- [ ] La exportación CSV abre en Excel sin fórmulas ejecutadas.
