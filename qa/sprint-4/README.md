# Pruebas unitarias y auditoría (Sprint 4)

Esta carpeta reúne lo que QA necesita para ejecutar y verificar las pruebas unitarias de autenticación y fechas, y la auditoría de dependencias. El cierre del sprint está en `cierre-sprint.md`.

La refactorización SOLID queda **fuera de alcance**: la arquitectura actual funciona y no se reescribe para cumplir una etiqueta. Lo que se entrega es la medición de calidad sobre el código existente.

## 1. Herramientas

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | 18 o superior | Ejecutar Jest. |
| npm | 9 o superior | Instalar dependencias y correr scripts. |
| Git | Cualquiera | Clonar el repositorio. |
| Terminal | Cualquiera | Ejecutar los comandos. |

No necesitas Docker, PostgreSQL, Android SDK ni la API desplegada. Las pruebas unitarias usan mocks, así que corren sin base de datos y sin internet (después de instalar dependencias).

## 2. Instalación

Desde la raíz del repositorio:

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

`npm ci` instala exactamente lo que está en `package-lock.json`. Si falla por un desajuste del lock, usa `npm install` y reporta el problema.

## 3. Ejecución

La forma corta, desde la raíz:

```bash
bash qa/scripts/run-unit-tests.sh
```

El script corre las dos suites con cobertura y guarda los logs en `qa/sprint-4/evidencias/`.

Por separado:

```bash
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage
```

## 4. Resultado esperado

| Suite | Archivos | Pruebas | Cobertura clave |
| --- | --- | --- | --- |
| Backend | 4 | 40 | `auth.controller`, `user.model`, `token.service`, `auth.middleware` y `event.schema` al 100%. |
| Frontend | 1 | 17 | `date.js` al 100%. |
| **Total** | **5** | **57** | Todas en verde. |

La cobertura global del backend ronda el 54% porque incluye eventos y exportación, que no son parte de este alcance. Lo que Sprint 4 pide, autenticación y fechas, queda al 100%.

### Qué cubre cada archivo

| Archivo | Casos |
| --- | --- |
| `backend/tests/user.model.test.js` | Normalización del correo, hash de contraseña, creación, búsqueda por correo e id, `toJSON` sin contraseña y verificación de clave. |
| `backend/tests/token.service.test.js` | Firma y verificación del JWT, token alterado, token con otro secreto y token vencido. |
| `backend/tests/auth.controller.test.js` | Registro 201/409/400, login 200/401/400, `me` 200/401/404 y ausencia del campo `password` en las respuestas. |
| `backend/tests/event.schema.test.js` | Fecha, horas, categoría, prioridad, campos extra, orden de horas, id de ruta y formato de errores. |
| `frontend/tests/date.test.js` | Conversión ISO, parseo local, mismo día, inicio del día, suma de meses, etiquetas, día de la semana y matriz de 42 días. |

## 5. Auditoría de dependencias

```bash
bash qa/scripts/run-audit.sh
```

O manualmente:

```bash
cd backend && npm audit --omit=dev
cd frontend && npm audit --omit=dev
```

Resultado esperado:

- **Backend:** 0 vulnerabilidades de producción.
- **Frontend:** 14 vulnerabilidades de producción, 4 altas, todas transitivas de Expo.

El detalle, las versiones y la decisión están en `auditoria-dependencias.md`.

No ejecutes `npm audit fix --force`. En el frontend baja Expo a la 52 y rompe el proyecto.

## 6. Qué significa "ejecutadas en vivo"

Las pruebas unitarias no se ejecutan contra la API desplegada: usan mocks y corren en Node. Para la revisión, muéstralas en vivo en la terminal:

1. `bash qa/scripts/run-unit-tests.sh` y muestra las 57 pruebas en verde.
2. `QA_BASE_URL=https://<api-desplegada> QA_ALLOW_REMOTE=1 node qa/scripts/smoke.mjs` y muestra las 35 pruebas funcionales contra el entorno desplegado.

Con eso cubres las dos cosas: unitarias en vivo y funcionales en vivo.

## 7. Evidencia

- Logs de las suites en `qa/sprint-4/evidencias/` (no se versionan).
- Captura de la terminal con el resumen de Jest.
- Captura de la tabla de cobertura.
- Salida de `npm audit` de backend y frontend.

## 8. Problemas comunes

| Síntoma | Qué hacer |
| --- | --- |
| `jest: not found` | Falta `npm ci` en esa carpeta. |
| `No tests found` | Ejecuta desde `backend` o `frontend`, no desde la raíz. |
| `npm ci` falla por Node | Usa Node 20 LTS con `nvm use 20`. |
| `bcrypt` no compila | Instala las build tools o usa Node 20 LTS. |
| `jest-expo` tarda la primera vez | Es normal, compila el preset. |
| `npm audit` sale con código 1 | Hay hallazgos. Repórtalos, no fuerces la corrección. |

## 9. Checklist

- [ ] Node 18 o superior instalado.
- [ ] `npm ci` ejecutado en backend y frontend.
- [ ] 40 pruebas de backend en verde.
- [ ] 17 pruebas de frontend en verde.
- [ ] Cobertura de autenticación y fechas al 100%.
- [ ] `npm audit --omit=dev` del backend sin vulnerabilidades.
- [ ] Hallazgos del frontend documentados.
- [ ] Logs guardados en `qa/sprint-4/evidencias/`.
- [ ] No se ejecutó `npm audit fix --force`.
