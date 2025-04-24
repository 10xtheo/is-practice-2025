import { ICalendar, TPartialCalendar, ICalendarCreate } from "types/calendar";
import { requestCalendars } from "./api";

const getCalendars = () => requestCalendars.get<ICalendar[]>('');

const createCalendar = (calendarData: ICalendarCreate) => requestCalendars.post<ICalendarCreate>('', calendarData);

const updateCalendar = (calendarId: string, calendarData: TPartialCalendar) => requestCalendars.put<ICalendar>(`/${calendarId}`, calendarData);

const deleteCalendar = (calendarId: string) => requestCalendars.delete<void>(`/${calendarId}`);

export default {
  getCalendars,
  createCalendar,
  updateCalendar,
  deleteCalendar
} 