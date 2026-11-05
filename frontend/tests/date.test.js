import {
  toISODate,
  fromISODate,
  isSameDay,
  startOfDay,
  addMonths,
  monthLabel,
  weekdayLong,
  formatLongDate,
  formatTimeRange,
  buildMonthMatrix,
} from '../src/domain/utils/date';

describe('toISODate', () => {
  test('rellena mes y día con dos dígitos', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('fromISODate', () => {
  test('devuelve una fecha local a medianoche', () => {
    const date = fromISODate('2026-11-05');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  test('hace ida y vuelta con toISODate', () => {
    expect(toISODate(fromISODate('2026-03-09'))).toBe('2026-03-09');
  });
});

describe('isSameDay', () => {
  test('compara solo año, mes y día', () => {
    expect(isSameDay(new Date(2026, 10, 5, 8, 0), new Date(2026, 10, 5, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 10, 5), new Date(2026, 10, 6))).toBe(false);
    expect(isSameDay(new Date(2026, 10, 5), new Date(2025, 10, 5))).toBe(false);
  });
});

describe('startOfDay', () => {
  test('deja la fecha a medianoche', () => {
    const result = startOfDay(new Date(2026, 10, 5, 18, 30, 15));

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getDate()).toBe(5);
  });
});

describe('addMonths', () => {
  test('suma meses y devuelve el día 1', () => {
    const result = addMonths(new Date(2026, 10, 5), 2);

    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  test('resta meses cruzando el año', () => {
    const result = addMonths(new Date(2026, 0, 15), -1);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(1);
  });
});

describe('monthLabel', () => {
  test('capitaliza el mes y agrega el año', () => {
    expect(monthLabel(new Date(2026, 10, 5))).toBe('Noviembre 2026');
  });
});

describe('weekdayLong', () => {
  test('devuelve el día en español empezando en lunes', () => {
    expect(weekdayLong(new Date(2026, 10, 5))).toBe('jueves');
    expect(weekdayLong(new Date(2026, 10, 9))).toBe('lunes');
    expect(weekdayLong(new Date(2026, 10, 8))).toBe('domingo');
  });
});

describe('formatLongDate', () => {
  test('arma la fecha larga en español', () => {
    expect(formatLongDate(new Date(2026, 10, 5))).toBe('Jueves, 5 de noviembre');
  });
});

describe('formatTimeRange', () => {
  test('muestra el rango cuando hay inicio y fin', () => {
    expect(formatTimeRange('09:00', '10:30')).toBe('09:00 - 10:30');
  });

  test('muestra solo el inicio si no hay fin', () => {
    expect(formatTimeRange('09:00', null)).toBe('09:00');
  });

  test('muestra Todo el día si no hay inicio', () => {
    expect(formatTimeRange(null, null)).toBe('Todo el día');
  });
});

describe('buildMonthMatrix', () => {
  test('devuelve 6 semanas de 7 días', () => {
    const matrix = buildMonthMatrix(new Date(2026, 10, 5));

    expect(matrix).toHaveLength(6);
    expect(matrix.every((week) => week.length === 7)).toBe(true);
  });

  test('empieza en lunes y cubre el mes completo', () => {
    const matrix = buildMonthMatrix(new Date(2026, 10, 5));
    const flat = matrix.flat();

    expect(weekdayLong(flat[0])).toBe('lunes');
    expect(flat.some((day) => toISODate(day) === '2026-11-01')).toBe(true);
    expect(flat.some((day) => toISODate(day) === '2026-11-30')).toBe(true);
  });

  test('incluye días de relleno del mes anterior y siguiente', () => {
    const matrix = buildMonthMatrix(new Date(2026, 10, 5));
    const flat = matrix.flat();

    expect(flat.some((day) => toISODate(day) === '2026-10-31')).toBe(true);
    expect(flat.some((day) => toISODate(day) === '2026-12-06')).toBe(true);
  });

  test('mantiene 42 días consecutivos', () => {
    const flat = buildMonthMatrix(new Date(2026, 1, 1)).flat();

    for (let index = 1; index < flat.length; index += 1) {
      const previous = new Date(flat[index - 1]);
      previous.setDate(previous.getDate() + 1);
      expect(toISODate(flat[index])).toBe(toISODate(previous));
    }
  });
});
