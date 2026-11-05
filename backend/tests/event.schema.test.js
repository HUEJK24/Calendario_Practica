const {
  createEventSchema,
  updateEventSchema,
  idParamSchema,
  formatIssues,
} = require('../src/validators/event.schema');

const validEvent = {
  title: '  Reunión de equipo  ',
  date: '2026-12-01',
  startTime: '09:00',
  endTime: '10:00',
  category: 'work',
  priority: 'high',
};

function firstIssue(result) {
  return result.error.issues[0];
}

describe('createEventSchema', () => {
  test('acepta un evento válido y normaliza el título', () => {
    const result = createEventSchema.safeParse(validEvent);

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Reunión de equipo');
    expect(result.data.description).toBe('');
  });

  test('rechaza una fecha con formato distinto a AAAA-MM-DD', () => {
    const result = createEventSchema.safeParse({ ...validEvent, date: '01-12-2026' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['date']);
  });

  test('rechaza una hora sin dos dígitos', () => {
    const result = createEventSchema.safeParse({ ...validEvent, startTime: '9:00' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['startTime']);
  });

  test('rechaza una hora fuera de rango', () => {
    const result = createEventSchema.safeParse({ ...validEvent, endTime: '24:00' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['endTime']);
  });

  test('rechaza una categoría no permitida', () => {
    const result = createEventSchema.safeParse({ ...validEvent, category: 'fiesta' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['category']);
  });

  test('rechaza una prioridad no permitida', () => {
    const result = createEventSchema.safeParse({ ...validEvent, priority: 'urgent' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['priority']);
  });

  test('rechaza un título vacío', () => {
    const result = createEventSchema.safeParse({ ...validEvent, title: '   ' });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['title']);
  });

  test('rechaza un título de más de 200 caracteres', () => {
    const result = createEventSchema.safeParse({ ...validEvent, title: 'a'.repeat(201) });

    expect(result.success).toBe(false);
    expect(firstIssue(result).path).toEqual(['title']);
  });

  test('rechaza un campo extra por .strict()', () => {
    const result = createEventSchema.safeParse({ ...validEvent, userId: 1 });

    expect(result.success).toBe(false);
  });

  test('rechaza una hora de fin igual o anterior a la de inicio', () => {
    const equal = createEventSchema.safeParse({ ...validEvent, endTime: '09:00' });
    const earlier = createEventSchema.safeParse({ ...validEvent, endTime: '08:00' });

    expect(equal.success).toBe(false);
    expect(earlier.success).toBe(false);
    expect(firstIssue(earlier).path).toEqual(['endTime']);
  });
});

describe('updateEventSchema', () => {
  test('acepta un evento completo válido', () => {
    const result = updateEventSchema.safeParse({ ...validEvent, description: 'Detalle' });

    expect(result.success).toBe(true);
    expect(result.data.description).toBe('Detalle');
  });

  test('rechaza un campo extra por .strict()', () => {
    const result = updateEventSchema.safeParse({ ...validEvent, id: 3 });

    expect(result.success).toBe(false);
  });

  test('rechaza horas invertidas', () => {
    const result = updateEventSchema.safeParse({ ...validEvent, endTime: '08:00' });

    expect(result.success).toBe(false);
  });
});

describe('idParamSchema', () => {
  test('convierte un id numérico en texto a número', () => {
    expect(idParamSchema.safeParse('12').data).toBe(12);
  });

  test('rechaza cero, negativos, decimales y texto', () => {
    for (const value of ['0', '-3', '1.5', 'abc']) {
      expect(idParamSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe('formatIssues', () => {
  test('devuelve field y message por cada error', () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      date: 'mal',
      category: 'fiesta',
    });

    const issues = formatIssues(result.error);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'date' }),
        expect.objectContaining({ field: 'category' }),
      ])
    );
    expect(issues.every((issue) => issue.message)).toBe(true);
  });
});
