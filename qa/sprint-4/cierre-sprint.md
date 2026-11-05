# Cierre del Sprint 4

Fecha: 5 de noviembre de 2026.

Objetivo del sprint: garantizar un estándar óptimo de calidad, legibilidad y resistencia a fallos sobre el software ya desplegado.

## Entregado

- 57 pruebas unitarias: 40 de backend y 17 de frontend, todas en verde.
- Cobertura del 100% en autenticación, validación de eventos y fechas.
- Auditoría de dependencias con `npm audit`: backend de producción sin vulnerabilidades.
- Guía de QA con el paso a paso, las herramientas y los resultados esperados.
- Documentación de los hallazgos transitivos del frontend y de la decisión de no aplicar `--force`.

## Evidencias

- `qa/sprint-4/README.md`: cómo ejecutar las pruebas y la auditoría.
- `qa/sprint-4/auditoria-dependencias.md`: resultados y decisión.
- `qa/Guia_QA_Sprint_Final_Jose_Manuel_Mandujano.pdf`: guía completa para QA.
- `qa/sprint-4/evidencias/`: logs de las ejecuciones (no se versionan).

## Credenciales y configuración

- Ningún `.env` está versionado; `.gitignore` los excluye.
- En producción, `env.js` exige `JWT_SECRET` y rechaza el valor de desarrollo.
- El README no publica endpoints ni conexiones externas.
- La URL de la API se entrega fuera del repositorio.
- Pendiente menor: `DB_PASSWORD` tiene un default de desarrollo. En producción se sobrescribe con variables de entorno; si se quiere endurecer, exigirlo también cuando `NODE_ENV=production`.

## Fuera de alcance

- Refactorización SOLID. La arquitectura actual funciona y no se reescribe para cumplir una etiqueta. Se documentan los patrones existentes: capas, Singleton, Strategy y Observer.
- Pruebas de carga y escaneo de seguridad con herramientas externas. Quedan como opcionales en `qa/README.md`.

## Riesgos

- El frontend mantiene 14 hallazgos de producción, 4 altas, transitivos de Expo. La corrección automática exige bajar Expo a la 52 y rompería la app.
- La cobertura global del backend ronda el 54% porque eventos y exportación quedan fuera del alcance de Sprint 4. Autenticación y fechas, que sí se pidieron, están al 100%.

## Retrospectiva

- Bien: las pruebas corren sin base de datos ni despliegue, así que QA las ejecuta en minutos.
- Bien: la suite funcional de 35 casos ya cubría el entorno desplegado y se complementa con las unitarias.
- Mejorar: el README afirmaba Sprint 4 sin pruebas reales. Ahora el texto coincide con el código.
- Acción: repetir `npm audit` y las 57 pruebas en cada cambio de dependencias o de lógica de fechas.

## Aceptación

- [ ] Las 57 pruebas unitarias pasan.
- [ ] La cobertura de autenticación y fechas es 100%.
- [ ] El backend de producción no reporta vulnerabilidades.
- [ ] Los hallazgos del frontend están documentados.
- [ ] La guía de QA está publicada y es reproducible.
