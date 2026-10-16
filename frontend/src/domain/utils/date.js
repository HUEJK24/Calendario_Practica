const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WEEKDAYS_LONG = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
];

export { MONTHS, WEEKDAYS_SHORT };

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function monthLabel(date) {
  const label = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function weekdayLong(date) {
  return WEEKDAYS_LONG[(date.getDay() + 6) % 7];
}

export function formatLongDate(date) {
  const weekday = weekdayLong(date);
  const month = MONTHS[date.getMonth()];
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${date.getDate()} de ${month}`;
}

export function formatTimeRange(start, end) {
  if (!start) return 'Todo el día';
  if (!end) return start;
  return `${start} - ${end}`;
}

/**
 * Construye una matriz de 6 semanas (42 días) que comienza en lunes
 * y cubre el mes solicitado, incluyendo días de relleno de meses vecinos.
 */
export function buildMonthMatrix(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  const weeks = [];
  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + week * 7 + day);
      days.push(current);
    }
    weeks.push(days);
  }
  return weeks;
}
