import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { eventsRepository } from '../../data/repositories/eventsRepository';
import { extractApiError } from '../../data/api/client';
import { eventBus } from '../../domain/observers/EventBus';
import { toISODate, startOfDay } from '../../domain/utils/date';

const EventsContext = createContext(null);

/**
 * Sprint 3 — El contexto actúa como Sujeto del patrón Observer: además de
 * exponer el estado de la agenda, publica cada cambio en el EventBus para que
 * los observadores (hoy, el programador de recordatorios locales) reaccionen
 * sin que este contexto los conozca.
 */
export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const refresh = useCallback(async () => {
    try {
      const list = await eventsRepository.list();
      setEvents(list);
      setLoadError('');
    } catch (error) {
      setLoadError(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const list = await eventsRepository.list();
        if (!isActive) return;
        setEvents(list);
        setLoadError('');
      } catch (error) {
        if (isActive) setLoadError(extractApiError(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  const eventsByDay = useMemo(() => {
    return events.reduce((map, event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
      return map;
    }, {});
  }, [events]);

  const getEventsForDay = useCallback(
    (date) => {
      const list = eventsByDay[toISODate(date)] || [];
      return [...list].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    },
    [eventsByDay]
  );

  const addEvent = useCallback(async (payload) => {
    const created = await eventsRepository.create(payload);
    setEvents((current) => [...current, created]);
    eventBus.notify({ type: 'created', event: created });
    return created;
  }, []);

  const updateEvent = useCallback(async (id, payload) => {
    const updated = await eventsRepository.update(id, payload);
    setEvents((current) => current.map((event) => (event.id === id ? updated : event)));
    eventBus.notify({ type: 'updated', event: updated });
    return updated;
  }, []);

  const deleteEvent = useCallback(async (id) => {
    await eventsRepository.remove(id);
    setEvents((current) => current.filter((event) => event.id !== id));
    eventBus.notify({ type: 'deleted', event: { id } });
  }, []);

  const value = useMemo(
    () => ({
      events,
      eventsByDay,
      isLoading,
      loadError,
      refresh,
      selectedDate,
      setSelectedDate,
      getEventsForDay,
      addEvent,
      updateEvent,
      deleteEvent,
    }),
    [
      events,
      eventsByDay,
      isLoading,
      loadError,
      refresh,
      selectedDate,
      getEventsForDay,
      addEvent,
      updateEvent,
      deleteEvent,
    ]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents debe usarse dentro de un EventsProvider.');
  }
  return context;
}
