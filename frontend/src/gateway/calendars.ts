import { ICalendar, TPartialCalendar, ICalendarCreate } from "types/calendar";
import { requestCalendars } from "./api";

const getCalendars = () => requestCalendars.get<{data: ICalendar[], count: number}>('');

const createCalendar = (calendarData: ICalendarCreate) => requestCalendars.post<ICalendar>('', calendarData);

const updateCalendar = (calendarId: string, calendarData: TPartialCalendar) => requestCalendars.put<ICalendar>(`/${calendarId}`, calendarData);

const deleteCalendar = (calendarId: string) => requestCalendars.delete<void>(`/${calendarId}`);

const patchCalendar = (calendarId: string, calendarData: TPartialCalendar) => requestCalendars.patch<ICalendar>(`/${calendarId}`, calendarData);

export default {
  getCalendars,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  patchCalendar
} 