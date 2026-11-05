# QA de SecurePlan Mobile

Guía completa para el responsable de QA: `qa/Guia_QA_Sprint_Final_Jose_Manuel_Mandujano.pdf`.

Cierre del Sprint 4 con evidencias: `qa/sprint-4/cierre-sprint.md`.

Las pruebas se hacen contra la aplicación desplegada, con el APK y la app web. El entorno local queda como apoyo para reproducir fallos.

## 1. Entorno

| Artefacto | Acceso |
| --- | --- |
| API | URL que entrega el responsable del proyecto. |
| App web | URL que entrega el responsable del proyecto. |
| App Android | Instalar `SecurePlan-Calendar-v1.0.1.apk`. |
| Base de datos | PostgreSQL administrado. Solo se usa a través de la API. |
| Postman / Newman | Local, con la colección de `qa/postman/`. |
| Script de humo | Local, con Node 18 o superior. |

No necesitas Expo Go ni Docker para la ruta principal. Las URLs no se publican en el repositorio.

## 2. Qué es `/health`

`GET /health` es el chequeo de salud de la API. Responde sin autenticación y confirma que el proceso está arriba y que la URL responde por HTTPS. Es la primera prueba de la sesión.

```bash
curl https://<api-desplegada>/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

| Sí confirma | No confirma |
| --- | --- |
| Que la API está arriba. | Que la base de datos responda. |
| Que la URL y el HTTPS funcionan. | Que el esquema tenga las tablas. |
| Que el servicio está en línea. | Que el registro o el CRUD funcionen. |

Si `/health` responde ok pero el registro devuelve 500, el problema está en la base. Después de un periodo de inactividad, la primera petición puede tardar: espera y reintenta.

## 3. Peticiones manuales

### Postman

1. Importa `qa/postman/SecurePlan-QA.postman_collection.json`.
2. Importa `qa/postman/SecurePlan-QA.postman_environment.json`.
3. Selecciona el entorno **SecurePlan QA Local** y cambia `baseUrl` por la URL de la API desplegada.
4. Ejecuta las carpetas en orden: Salud, Autenticación, Eventos, Exportación, Seguridad.

La colección guarda `token`, `email` y `eventId` después de cada request. `otherEventId` se llena a mano: registra un segundo usuario, crea un evento con su token y pega ese id. La request de IDOR debe responder 404.

| Carpeta | Qué verifica |
| --- | --- |
| Salud | `GET /health` responde 200. |
| Autenticación | Registro 201 sin exponer la contraseña, duplicado 409, validaciones 400, login 200/401, `me` con y sin token. |
| Eventos | CRUD completo, 400 en id no numérico, 404 en id inexistente, 204 en borrado. |
| Exportación | JSON y CSV con cabecera correcta, formato inválido 400, sin token 401. |
| Seguridad | IDOR en lectura, campo extra rechazado por `.strict()`, fin anterior al inicio. |

### Otras herramientas

- **Insomnia** y **Thunder Client** (VS Code) importan la misma colección.
- **curl** o **httpie** para una petición suelta.
- **Newman** corre la colección sin abrir Postman:

```bash
npx newman run qa/postman/SecurePlan-QA.postman_collection.json \
  -e qa/postman/SecurePlan-QA.postman_environment.json \
  --env-var baseUrl=https://<api-desplegada>
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
curl -s -X POST https://<api-desplegada>/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa+1@example.com","password":"QaPassword123!"}'

TOKEN=$(curl -s -X POST https://<api-desplegada>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa+1@example.com","password":"QaPassword123!"}' | jq -r .token)

curl -s -X POST https://<api-desplegada>/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Reunión","date":"2026-12-01","startTime":"09:00","endTime":"10:00","category":"work","priority":"high"}'
```

`jq` es opcional; sin él, copia el token de la respuesta a mano.

## 4. Pruebas por script

```bash
QA_BASE_URL=https://<api-desplegada> QA_ALLOW_REMOTE=1 node qa/scripts/smoke.mjs
```

El script no instala nada: usa `fetch` de Node 18 o superior. Crea dos usuarios `qa+...@example.com`, corre 35 casos y termina con el resumen. Contra un destino que no es local exige `QA_ALLOW_REMOTE=1` para no ensuciar la base por accidente.

En local:

```bash
node qa/scripts/smoke.mjs
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

## 5. Datos de prueba y limpieza

La base desplegada es la real. Usa correos con prefijo `qa+` y no borres usuarios ni eventos que no hayas creado. Para pruebas destructivas, pide al responsable una rama de la base o un servicio de staging.

El script borra sus eventos, pero deja los usuarios. Si tienes acceso a la base:

```bash
psql "$DATABASE_URL" -f qa/scripts/cleanup.sql
```

Si no tienes acceso, pide al responsable que ejecute ese script. En local:

```bash
docker exec -i calendario-db psql -U calendario -d calendario < qa/scripts/cleanup.sql
```

## 6. App móvil y web

- **APK:** instala `SecurePlan-Calendar-v1.0.1.apk`. Ya apunta a la API desplegada, así que no hay que configurar nada.
- **App web:** abre la URL del despliegue y repite registro, login y CRUD. SecureStore y las notificaciones son APIs nativas; si la sesión no persiste o el recordatorio no aparece en el navegador, anótalo como limitación y valida ese caso en el APK.
- **Expo Go:** solo para depurar en local. No forma parte de estas pruebas.

## 7. Pruebas unitarias y auditoría (Sprint 4)

Guía detallada: `qa/sprint-4/README.md`.

### Herramientas

| Herramienta | Versión | Uso |
| --- | --- | --- |
| Node.js | 18 o superior | Ejecutar Jest. |
| npm | 9 o superior | Instalar dependencias y correr scripts. |
| Git | Cualquiera | Clonar el repositorio. |
| Terminal | Cualquiera | Ejecutar los comandos. |

No necesitas Docker, PostgreSQL, Android SDK ni la API desplegada: las pruebas unitarias usan mocks.

### Instalación

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

### Ejecución

```bash
bash qa/scripts/run-unit-tests.sh
```

O por separado:

```bash
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage
```

Resultado esperado: 40 pruebas de backend y 17 de frontend, 57 en total, todas en verde. La cobertura es 100% en `user.model`, `token.service`, `auth.controller`, `auth.middleware`, `event.schema` y `date.js`.

| Suite | Archivos | Pruebas | Cobertura clave |
| --- | --- | --- | --- |
| Backend | 4 | 40 | Autenticación y validación al 100%. |
| Frontend | 1 | 17 | `date.js` al 100%. |

### Auditoría de dependencias

```bash
bash qa/scripts/run-audit.sh
```

O:

```bash
cd backend && npm audit --omit=dev
cd frontend && npm audit --omit=dev
```

El backend de producción queda sin vulnerabilidades. El frontend mantiene hallazgos transitivos de Expo; el detalle y la decisión están en `qa/sprint-4/auditoria-dependencias.md`. No ejecutes `npm audit fix --force`.

### Evidencia

Los scripts guardan los logs en `qa/sprint-4/evidencias/`. Adjunta una captura de la terminal con el resumen y el reporte de cobertura.

### Alcance

La refactorización SOLID queda fuera de esta entrega. La arquitectura actual se mantiene; estas pruebas miden la calidad de lo que ya funciona.

## 8. Herramientas opcionales

- **k6** para carga: un script JS con `http.post` y umbrales de latencia.
- **OWASP ZAP** para un escaneo pasivo de la API o de la versión web.
- **Maestro** para E2E del APK con flujos YAML (registro, login, crear evento).
- **Playwright** para la versión web.

## 9. Checklist manual

- [ ] `GET /health` responde 200 con `status: ok`.
- [ ] Registro con correo repetido responde 409 y no crea fila.
- [ ] La respuesta de registro y login nunca incluye `password`.
- [ ] Un token vencido o alterado responde 401 y la app borra la sesión.
- [ ] El usuario B no ve, edita ni borra eventos del usuario A.
- [ ] Un evento con `endTime <= startTime` no se guarda.
- [ ] La agenda agrupa el evento en la fecha correcta, sin corrimiento por zona horaria.
- [ ] El recordatorio se programa con la hora local del dispositivo.
- [ ] La exportación CSV abre en Excel sin fórmulas ejecutadas.
- [ ] Los usuarios `qa+` creados durante la sesión quedaron borrados.
