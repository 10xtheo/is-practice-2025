import { ICalendar, TPartialCalendar, ICalendarCreate } from 'types/calendar';
import { IServerUserCategoryParticipant } from 'types/user';
import { requestCalendars, requestCalendarParticipants } from './api';

const getCalendars = () => requestCalendars.get<{ data: ICalendar[]; count: number }>('');

const getParticipants = (calendarId: string) =>
	requestCalendars.get<{ data: IServerUserCategoryParticipant[]; count: number }>(`/${calendarId}/participants`);

const createCalendar = (calendarData: ICalendarCreate) => requestCalendars.post<ICalendar>('', calendarData);

const updateCalendar = (calendarId: string, calendarData: TPartialCalendar) =>
	requestCalendars.put<ICalendar>(`/${calendarId}`, calendarData);

const deleteCalendar = (calendarId: string) => requestCalendars.delete<void>(`/${calendarId}`);

const patchCalendar = (calendarId: string, calendarData: TPartialCalendar) =>
	requestCalendars.patch<ICalendar>(`/${calendarId}`, calendarData);

const addParticipant = (calendarId: string, participant: IServerUserCategoryParticipant) =>
	requestCalendarParticipants.post<IServerUserCategoryParticipant>(`/${calendarId}/participants`, participant);

const deleteParticipant = (calendarId: string, userId: string) =>
	requestCalendarParticipants.delete<unknown>(`/${calendarId}/participants/${userId}`);

export default {
	getCalendars,
	getParticipants,
	createCalendar,
	updateCalendar,
	deleteCalendar,
	patchCalendar,
	addParticipant,
	deleteParticipant,
};
