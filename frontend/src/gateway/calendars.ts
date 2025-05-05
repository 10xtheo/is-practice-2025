import { ICalendar, TPartialCalendar, ICalendarCreate } from "types/calendar";
import { IServerUserCategoryParticipant } from "types/user";
import { requestCalendars } from "./api";

const getCalendars = () => requestCalendars.get<{data: ICalendar[], count: number}>('');

const getParticipants = (calendarId: string) => requestCalendars.get<{data: IServerUserCategoryParticipant[], count: number}>(`/${calendarId}/participants`);

const createCalendar = (calendarData: ICalendarCreate) => requestCalendars.post<ICalendar>('', calendarData);

const updateCalendar = (calendarId: string, calendarData: TPartialCalendar) => requestCalendars.put<ICalendar>(`/${calendarId}`, calendarData);

const deleteCalendar = (calendarId: string) => requestCalendars.delete<void>(`/${calendarId}`);

const patchCalendar = (calendarId: string, calendarData: TPartialCalendar) => requestCalendars.patch<ICalendar>(`/${calendarId}`, calendarData);

export default {
  getCalendars,
  getParticipants,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  patchCalendar
} 