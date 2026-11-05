#!/usr/bin/env node
/**
 * Smoke test E2E de la API de SecurePlan Mobile.
 * Sin dependencias: usa fetch nativo de Node 18+.
 *
 *   node qa/scripts/smoke.mjs
 *   QA_BASE_URL=https://mi-api.example.com QA_ALLOW_REMOTE=1 node qa/scripts/smoke.mjs
 *
 * El script crea usuarios y eventos reales. Contra un entorno remoto exige
 * QA_ALLOW_REMOTE=1 para no ensuciar la base por accidente.
 *
 * Sale con código 0 si todo pasa y 1 si falla algo.
 */
import assert from 'node:assert/strict';

const BASE_URL = (process.env.QA_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');

function isLocalHost(value) {
  try {
    const host = new URL(value).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '10.0.2.2' ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    );
  } catch {
    return false;
  }
}

const LOCAL = isLocalHost(BASE_URL);
const PASSWORD = 'QaPassword123!';
const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const userA = { email: `qa+${stamp}@example.com`, password: PASSWORD };
const userB = { email: `qa+b+${stamp}@example.com`, password: PASSWORD };

const state = {};
const results = [];

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: response.status, headers: response.headers, data, text };
}

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${String(error.message).split('\n').join('\n        ')}`);
  }
}

const eventPayload = {
  title: 'QA evento',
  description: 'Creado por smoke.mjs',
  date: '2026-12-01',
  startTime: '09:00',
  endTime: '10:30',
  category: 'work',
  priority: 'high',
};

async function run() {
  if (!LOCAL && process.env.QA_ALLOW_REMOTE !== '1') {
    console.error(`El destino ${BASE_URL} no es local.`);
    console.error('El script crea usuarios y eventos reales en esa base de datos.');
    console.error('Si es un entorno de pruebas, repite con QA_ALLOW_REMOTE=1.');
    process.exitCode = 1;
    return;
  }

  try {
    await fetch(`${BASE_URL}/health`);
  } catch {
    console.error(`No se pudo conectar a ${BASE_URL}.`);
    if (LOCAL) {
      console.error('Levanta el backend: cd backend && docker compose up -d && npm run dev');
    } else {
      console.error('Revisa la URL y que el servicio esté arriba. Puede tardar en despertar.');
    }
    process.exitCode = 1;
    return;
  }

  console.log(`\nSecurePlan QA — ${BASE_URL}\n`);
  if (!LOCAL) {
    console.log('AVISO: entorno remoto. Se crearán usuarios y eventos de prueba reales.\n');
  }

  console.log('Salud');
  await test('GET /health responde ok', async () => {
    const res = await api('/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'ok');
  });

  console.log('\nAutenticación');
  await test('registro crea usuario y devuelve token', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: userA });
    assert.equal(res.status, 201);
    assert.equal(res.data.user.email, userA.email);
    assert.ok(res.data.token, 'falta el token');
    assert.ok(!('password' in res.data.user), 'la respuesta expone la contraseña');
    state.tokenA = res.data.token;
    state.userIdA = res.data.user.id;
  });

  await test('registro duplicado responde 409', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: userA });
    assert.equal(res.status, 409);
  });

  await test('registro con contraseña corta responde 400', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: { email: `qa+weak+${stamp}@example.com`, password: '123' },
    });
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.data.errors));
  });

  await test('registro con correo inválido responde 400', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: { email: 'no-es-correo', password: PASSWORD },
    });
    assert.equal(res.status, 400);
  });

  await test('login con contraseña incorrecta responde 401', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { email: userA.email, password: 'OtraClave123!' },
    });
    assert.equal(res.status, 401);
  });

  await test('login correcto devuelve token', async () => {
    const res = await api('/api/auth/login', { method: 'POST', body: userA });
    assert.equal(res.status, 200);
    assert.ok(res.data.token);
    state.tokenA = res.data.token;
  });

  await test('GET /api/auth/me devuelve el usuario del token', async () => {
    const res = await api('/api/auth/me', { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.data.user.email, userA.email);
  });

  await test('GET /api/auth/me sin token responde 401', async () => {
    const res = await api('/api/auth/me');
    assert.equal(res.status, 401);
  });

  await test('GET /api/auth/me con token inválido responde 401', async () => {
    const res = await api('/api/auth/me', { token: 'token.falso.invalido' });
    assert.equal(res.status, 401);
  });

  console.log('\nEventos');
  await test('usuario nuevo lista cero eventos', async () => {
    const res = await api('/api/events', { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.deepEqual(res.data.events, []);
  });

  await test('crear evento responde 201', async () => {
    const res = await api('/api/events', {
      method: 'POST',
      token: state.tokenA,
      body: eventPayload,
    });
    assert.equal(res.status, 201);
    assert.ok(Number.isInteger(res.data.event.id));
    assert.equal(res.data.event.title, eventPayload.title);
    assert.match(res.data.event.date, /^\d{4}-\d{2}-\d{2}$/, 'date debe ser AAAA-MM-DD');
    assert.match(res.data.event.startTime, /^\d{2}:\d{2}$/, 'startTime debe ser HH:MM');
    state.eventId = res.data.event.id;
  });

  await test('crear evento con campo extra responde 400 (strict)', async () => {
    const res = await api('/api/events', {
      method: 'POST',
      token: state.tokenA,
      body: { ...eventPayload, userId: 1 },
    });
    assert.equal(res.status, 400);
  });

  await test('crear evento con fin anterior al inicio responde 400', async () => {
    const res = await api('/api/events', {
      method: 'POST',
      token: state.tokenA,
      body: { ...eventPayload, startTime: '11:00', endTime: '10:00' },
    });
    assert.equal(res.status, 400);
  });

  await test('crear evento con fecha mal formada responde 400', async () => {
    const res = await api('/api/events', {
      method: 'POST',
      token: state.tokenA,
      body: { ...eventPayload, date: '01-12-2026' },
    });
    assert.equal(res.status, 400);
  });

  await test('crear evento con categoría no permitida responde 400', async () => {
    const res = await api('/api/events', {
      method: 'POST',
      token: state.tokenA,
      body: { ...eventPayload, category: 'fiesta' },
    });
    assert.equal(res.status, 400);
  });

  await test('crear evento sin token responde 401', async () => {
    const res = await api('/api/events', { method: 'POST', body: eventPayload });
    assert.equal(res.status, 401);
  });

  await test('listar eventos devuelve el evento creado', async () => {
    const res = await api('/api/events', { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.data.events.length, 1);
    assert.equal(res.data.events[0].id, state.eventId);
  });

  await test('obtener evento por id responde 200', async () => {
    const res = await api(`/api/events/${state.eventId}`, { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.data.event.id, state.eventId);
  });

  await test('id no numérico responde 400', async () => {
    const res = await api('/api/events/abc', { token: state.tokenA });
    assert.equal(res.status, 400);
  });

  await test('evento inexistente responde 404', async () => {
    const res = await api('/api/events/99999999', { token: state.tokenA });
    assert.equal(res.status, 404);
  });

  await test('actualizar evento responde 200', async () => {
    const res = await api(`/api/events/${state.eventId}`, {
      method: 'PUT',
      token: state.tokenA,
      body: { ...eventPayload, title: 'QA evento actualizado', priority: 'low' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.event.title, 'QA evento actualizado');
    assert.equal(res.data.event.priority, 'low');
  });

  console.log('\nAislamiento entre usuarios (IDOR)');
  await test('registro del segundo usuario', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: userB });
    assert.equal(res.status, 201);
    state.tokenB = res.data.token;
  });

  await test('otro usuario no puede leer el evento (404)', async () => {
    const res = await api(`/api/events/${state.eventId}`, { token: state.tokenB });
    assert.equal(res.status, 404);
  });

  await test('otro usuario no puede actualizar el evento (404)', async () => {
    const res = await api(`/api/events/${state.eventId}`, {
      method: 'PUT',
      token: state.tokenB,
      body: eventPayload,
    });
    assert.equal(res.status, 404);
  });

  await test('otro usuario no puede borrar el evento (404)', async () => {
    const res = await api(`/api/events/${state.eventId}`, {
      method: 'DELETE',
      token: state.tokenB,
    });
    assert.equal(res.status, 404);
  });

  await test('el dueño sigue viendo su evento', async () => {
    const res = await api(`/api/events/${state.eventId}`, { token: state.tokenA });
    assert.equal(res.status, 200);
  });

  console.log('\nExportación');
  await test('export JSON devuelve solo los eventos del usuario', async () => {
    const res = await api('/api/events/export?format=json', { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /application\/json/);
    assert.ok(Array.isArray(res.data));
    assert.equal(res.data.length, 1);
    assert.equal(res.data[0].id, state.eventId);
  });

  await test('export CSV devuelve cabecera y fila', async () => {
    const res = await api('/api/events/export?format=csv', { token: state.tokenA });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/csv/);
    assert.ok(res.text.startsWith('id,title,description,date,startTime,endTime,category,priority'));
    assert.ok(res.text.includes('QA evento actualizado'));
    assert.ok(res.text.includes('2026-12-01'), 'la columna date debe ser AAAA-MM-DD');
  });

  await test('export con formato no soportado responde 400', async () => {
    const res = await api('/api/events/export?format=xml', { token: state.tokenA });
    assert.equal(res.status, 400);
  });

  await test('export con parámetro extra responde 400 (strict)', async () => {
    const res = await api('/api/events/export?format=json&extra=1', { token: state.tokenA });
    assert.equal(res.status, 400);
  });

  await test('export sin token responde 401', async () => {
    const res = await api('/api/events/export?format=json');
    assert.equal(res.status, 401);
  });

  console.log('\nBorrado y rutas');
  await test('borrar evento responde 204 sin cuerpo', async () => {
    const res = await api(`/api/events/${state.eventId}`, {
      method: 'DELETE',
      token: state.tokenA,
    });
    assert.equal(res.status, 204);
    assert.equal(res.text, '');
  });

  await test('borrar dos veces responde 404', async () => {
    const res = await api(`/api/events/${state.eventId}`, {
      method: 'DELETE',
      token: state.tokenA,
    });
    assert.equal(res.status, 404);
  });

  await test('ruta desconocida responde 404', async () => {
    const res = await api('/api/desconocido');
    assert.equal(res.status, 404);
  });

  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas OK`);
  if (failed.length > 0) {
    console.log(
      `Fallaron ${failed.length}:\n${failed.map((item) => `- ${item.name}`).join('\n')}`
    );
    process.exitCode = 1;
  }
  console.log(`\nCorreos de prueba: ${userA.email} | ${userB.email}`);
  if (LOCAL) {
    console.log(
      'Limpieza: docker exec -i calendario-db psql -U calendario -d calendario < qa/scripts/cleanup.sql\n'
    );
  } else {
    console.log('Limpieza: pide al responsable ejecutar qa/scripts/cleanup.sql en la base desplegada.\n');
  }
}

run().catch((error) => {
  console.error(`\nNo se pudo completar la prueba contra ${BASE_URL}`);
  console.error(`${error.message}\n`);
  console.error(
    LOCAL
      ? 'Revisa que el backend esté arriba: cd backend && docker compose up -d && npm run dev'
      : 'Revisa la URL y que el servicio esté arriba.'
  );
  process.exitCode = 1;
});
