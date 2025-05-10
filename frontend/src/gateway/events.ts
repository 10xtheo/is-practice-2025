import {
	IEvent,
	IEventCreate,
	IServerEvent,
	TPartialEvent,
	IEventTimeManagement,
	IEventChatHistory,
} from 'types/event';
import { requestEvents, requestEventParticipants } from './api';
import { IServerUserParticipant } from 'types/user';

const getEvents = () => requestEvents.get<IServerEvent[]>('/permissions-and-participants');

const createEvent = (eventData: IEventCreate) => requestEvents.post<IEvent>('', eventData);

const deleteEvent = (eventId: string) => requestEvents.delete(`/${eventId}`);

const updateEvent = (eventId: string, eventData: TPartialEvent) => requestEvents.put<IEvent>(`/${eventId}`, eventData);

const patchEvent = (eventId: string, eventData: TPartialEvent) => requestEvents.patch<IEvent>(`/${eventId}`, eventData);

const findAvailableTimeSlots = (body: IEventTimeManagement) =>
	requestEvents.postTimeManagement<string[]>('/find-available-time', body);

const getEventMessages = (eventId: string) =>
	requestEvents.get<{ data: IEventChatHistory[]; count: number }>(`/${eventId}/messages`);

const addParticipant = (eventId: string, participant: IServerUserParticipant) =>
	requestEventParticipants.post<IServerUserParticipant>(`/${eventId}/participants`, participant);

const deleteParticipant = (eventId: string, userId: string) =>
	requestEventParticipants.delete<unknown>(`/${eventId}/participants/${userId}`);

export default {
	getEvents,
	createEvent,
	deleteEvent,
	updateEvent,
	patchEvent,
	addParticipant,
	deleteParticipant,
	findAvailableTimeSlots,
	getEventMessages,
};
