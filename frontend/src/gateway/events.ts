import { IEvent, IEventCreate, IServerEvent, TPartialEvent } from "types/event";
import { requestEvents } from "./api";

const getEvents = () => requestEvents.get<{data: IServerEvent[], count: number}>('');

const createEvent = (eventData: IEventCreate) => requestEvents.post<IEvent>('', eventData);

const deleteEvent = (eventId: string) => requestEvents.delete(`/${eventId}`);

const updateEvent = (eventId: string, eventData: TPartialEvent) => requestEvents.put<IEvent>(`/${eventId}`, eventData);

const patchEvent = (eventId: string, eventData: TPartialEvent) => requestEvents.patch<IEvent>(`/${eventId}`, eventData);

export default {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  patchEvent
}