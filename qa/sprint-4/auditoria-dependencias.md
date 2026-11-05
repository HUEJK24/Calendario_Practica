# Auditoría de dependencias

Fecha: 5 de noviembre de 2026.

Alcance: dependencias de producción de backend y frontend, más el total con dependencias de desarrollo.

Herramienta: `npm audit`, la auditoría automatizada que pide Sprint 4. Snyk es opcional y requiere cuenta; no se usó.

## Comandos

```bash
cd backend && npm audit --omit=dev
cd frontend && npm audit --omit=dev
```

Para el total con desarrollo:

```bash
cd backend && npm audit
cd frontend && npm audit
```

## Backend

| Momento | Producción | Total | Detalle |
| --- | --- | --- | --- |
| Antes | 1 alta | 20 | `body-parser` 2.3.0 con denegación de servicio por bytes finales. |
| Después | 0 | 19 | Se actualizó `body-parser` a 2.4.0 con `npm audit fix`. |

Las 19 restantes son de desarrollo, casi todas de Jest y sus dependencias. La corrección automática exige bajar Jest a la 25, un cambio mayor que no se aplicó. No afectan al runtime desplegado.

## Frontend

| Alcance | Total | Altas | Moderadas | Bajas |
| --- | --- | --- | --- | --- |
| Producción | 14 | 4 | 9 | 1 |
| Con desarrollo | 39 | 4 | 34 | 1 |

Hallazgos altos de producción:

| Paquete | Origen | Riesgo |
| --- | --- | --- |
| `@expo/cli` | Herramientas de Expo | Transitivo de `@expo/metro-config`, `glob` y `zod`. |
| `follow-redirects` | Dependencia transitiva | Credenciales personalizadas podrían seguir redirecciones. |
| `node-forge` | Dependencia transitiva | Verificación de firmas RSA y ASN.1. |
| `zod` | Dentro de `expo` | Consumo de memoria con colecciones grandes. |

## Decisión

- **Backend:** producción sin vulnerabilidades. Es el servicio que queda expuesto en la API.
- **Frontend:** no se aplicó `npm audit fix --force` porque instala Expo 52 y rompe la app actual. La corrección automática sin `--force` agrega y cambia decenas de paquetes de Expo y React Native, así que tampoco se aplicó sin una prueba completa del APK.
- Los hallazgos del frontend son transitivos de herramientas de Expo. Se documentan como riesgo aceptado y se revisan cuando haya una versión compatible de Expo que actualice `zod` y `node-forge`.
- No se modificó la arquitectura ni se hizo refactor SOLID. El objetivo de esta entrega es medir y documentar, no reescribir lo que funciona.

## Cómo reproducir

```bash
bash qa/scripts/run-audit.sh
```

Los reportes quedan en `qa/sprint-4/evidencias/`.

## Recomendación para QA

1. Ejecuta la auditoría y guarda la salida.
2. Reporta los hallazgos tal como aparecen, sin corregirlos.
3. No ejecutes `npm audit fix --force`.
4. Si el responsable actualiza Expo, vuelve a correr la auditoría y las 57 pruebas unitarias.
