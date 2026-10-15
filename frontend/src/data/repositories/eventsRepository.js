import { apiClient } from '../api/client';
import { Event } from '../../domain/entities/Event';

function toPayload(event) {
  return {
    title: event.title,
    description: event.description ?? '',
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    category: event.category,
    priority: event.priority,
  };
}

/**
 * Implementación HTTP del contrato de eventos.
 * El JWT se adjunta automáticamente mediante el interceptor global del cliente.
 */
export const eventsRepository = {
  async list() {
    const { data } = await apiClient.get('/api/events');
    return (data.events || []).map((event) => Event.fromApi(event));
  },

  async create(event) {
    const { data } = await apiClient.post('/api/events', toPayload(event));
    return Event.fromApi(data.event);
  },

  async update(id, event) {
    const { data } = await apiClient.put(`/api/events/${id}`, toPayload(event));
    return Event.fromApi(data.event);
  },

  async remove(id) {
    await apiClient.delete(`/api/events/${id}`);
  },
};
