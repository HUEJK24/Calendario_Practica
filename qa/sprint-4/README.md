# Pruebas unitarias y auditoría (Sprint 4)

Esta carpeta reúne lo que QA necesita para ejecutar y verificar las pruebas unitarias de autenticación y fechas, y la auditoría de dependencias. El cierre del sprint está en `cierre-sprint.md`.

La refactorización SOLID queda **fuera de alcance**: la arquitectura actual funciona y no se reescribe para cumplir una etiqueta. Lo que se entrega es la medición de calidad sobre el código existente.

## 1. Herramientas

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | 20 LTS (mínimo 18) | Ejecutar Jest. |
| npm | 10 o superior | Instalar dependencias y correr scripts. |
| Git | Cualquiera | Clonar el repositorio. |
| Terminal | Cualquiera | Ejecutar los comandos. |

No necesitas Docker, PostgreSQL, Android SDK ni la API desplegada. Las pruebas unitarias usan mocks, así que corren sin base de datos y sin internet (después de instalar dependencias).

### Requisitos del equipo

| Recurso | Mínimo | Recomendado |
| --- | --- | --- |
| RAM | 8 GB | 8 GB o más |
| CPU | Intel i3 de 13.ª generación | i5 o Ryzen 5 |
| Disco libre | 5 GB | 8 GB |
| Sistema | Windows 10 u 11 | Windows 11 |
| Internet | Sí, para `npm ci` | Conexión estable |

Con 8 GB alcanza. La laptop no levanta la base de datos ni el backend: solo ejecuta Node y hace peticiones al entorno desplegado.

### Windows

- Usa **Node.js 20 LTS**. Evita Node 22 o 24 porque `bcrypt` y `jest-expo` pueden fallar.
- Instala **Git para Windows**, que incluye Git Bash para los scripts `.sh`.
- Clona el repositorio en una ruta corta, por ejemplo `C:\qa\Calendario`. Evita OneDrive, espacios y acentos.
- Si PowerShell bloquea `npm.ps1`, usa Git Bash o `npm.cmd`. No cambies la política de ejecución sin permiso del responsable.
- En PowerShell, las variables de entorno se definen con `$env:`, no con `VAR=valor`.

## 2. Instalación

Desde la raíz del repositorio:

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

`npm ci` instala exactamente lo que está en `package-lock.json`. Si falla por un desajuste del lock, usa `npm install` y reporta el problema.

### Qué instala cada carpeta

| Carpeta | Comando | Dependencias |
| --- | --- | --- |
| `backend/` | `npm ci` | `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv` y `zod`. Para pruebas: `jest` y `supertest`. |
| `frontend/` | `npm ci` | `expo`, `react`, `react-native`, navegación, `axios`, `expo-secure-store` y `expo-notifications`. Para pruebas: `jest-expo` y `eslint`. |
| `qa/` | Nada | Los scripts usan Node y `fetch`; no tienen `package.json`. |

En disco, el backend ocupa unos 70 MB y el frontend unos 1.6 GB después de instalar. Ejecuta `npm ci` desde cada carpeta, no desde la raíz.

Solo si vas a correr el backend en local, copia `backend/.env.example` a `backend/.env` y ajusta la conexión a PostgreSQL y `JWT_SECRET`. Para el frontend, copia `frontend/.env.example` a `frontend/.env` y define `EXPO_PUBLIC_API_URL` con la URL del responsable. Ningún `.env` se versiona.

### Herramientas opcionales

| Herramienta | Cuándo instalarla |
| --- | --- |
| Docker Desktop | Solo si levantas PostgreSQL en local. Para QA contra la API desplegada no se usa. |
| Postman o Newman | Para ejecutar la colección. Opcional; el script de humo no lo necesita. |
| Expo Go | Solo para depurar el frontend en local. El APK no lo necesita. |
| JDK 17 y Android SDK | Solo para compilar el APK. No se instalan para QA. |

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

## 10. Precauciones en Windows

| Precaución | Por qué |
| --- | --- |
| No ejecutes Docker ni un emulador de Android. | No hacen falta y consumen la RAM que necesita Jest. |
| Cierra Chrome, Teams y OneDrive durante el `npm ci` del frontend. | Es el paso más pesado: instala las dependencias de Expo. |
| Mantén al menos 5 GB libres. | `node_modules` del frontend ocupa entre 1.5 y 2.5 GB. |
| No uses Node 22 o 24. | `bcrypt` y `jest-expo` pueden fallar. |
| No ejecutes `npm audit fix` ni `--force`. | Cambia dependencias y en el frontend baja Expo a la 52. |
| No uses cuentas reales. | El script de humo crea usuarios y eventos reales. |
| No borres datos que no empiecen con `qa+`. | La base desplegada es la de producción. |
| No compartas tokens ni capturas con `Authorization`. | Un token da acceso a la cuenta. |
| Espera la primera petición. | El servicio puede tardar en despertar; reintenta. |
| Permite la carpeta del proyecto en Defender. | El antivirus puede ralentizar `npm ci`; no desactives la protección. |
| Verifica la fecha y hora de Windows. | Un reloj desfasado invalida los JWT. |

### Errores típicos

| Error | Solución |
| --- | --- |
| `npm.ps1 cannot be loaded` | Usa Git Bash o `npm.cmd`. |
| `bcrypt` no compila | Instala Node 20 LTS y repite `npm ci`. |
| `ENAMETOOLONG` | Mueve el repo a `C:\qa\Calendario`. |
| `EPERM` o archivo bloqueado | Cierra OneDrive y VS Code, y reintenta. |
| `bash` no se reconoce | Abre Git Bash. |
| `QA_ALLOW_REMOTE` no se aplica | En PowerShell usa `$env:QA_ALLOW_REMOTE="1"`. |
| `No tests found` | Ejecuta desde `backend` o `frontend`, no desde la raíz. |
