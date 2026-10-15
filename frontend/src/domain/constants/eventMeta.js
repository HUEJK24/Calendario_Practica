export const EVENT_CATEGORIES = [
  { key: 'work', label: 'Trabajo', color: '#38BDF8' },
  { key: 'personal', label: 'Personal', color: '#34D399' },
  { key: 'study', label: 'Estudio', color: '#A78BFA' },
  { key: 'health', label: 'Salud', color: '#FB7185' },
  { key: 'other', label: 'Otro', color: '#FBBF24' },
];

export const EVENT_PRIORITIES = [
  { key: 'high', label: 'Alta', color: '#F87171' },
  { key: 'medium', label: 'Media', color: '#FBBF24' },
  { key: 'low', label: 'Baja', color: '#34D399' },
];

export const DEFAULT_CATEGORY = 'other';
export const DEFAULT_PRIORITY = 'medium';

const FALLBACK = { key: 'other', label: 'Otro', color: '#94A3B8' };

export function getCategory(key) {
  return EVENT_CATEGORIES.find((category) => category.key === key) || FALLBACK;
}

export function getPriority(key) {
  return EVENT_PRIORITIES.find((priority) => priority.key === key) || FALLBACK;
}
