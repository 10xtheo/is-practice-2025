import { IEvent, IEventCreate, TPartialEvent } from "types/event";
import { requestEvents } from "./api";

const getEvents = () => requestEvents.get<IEvent[]>('');

const createEvent = (eventData: IEventCreate) => requestEvents.post<IEvent>('', eventData);

const deleteEvent = (eventId: string) => requestEvents.delete(`/${eventId}`);

const updateEvent = (eventId: string, eventData: TPartialEvent) => requestEvents.put<IEvent>(`/${eventId}`, eventData);

export default {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent
}