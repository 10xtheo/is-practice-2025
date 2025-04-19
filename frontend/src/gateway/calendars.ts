import { ICalendar, ICalendarCreate } from "types/calendar";
import { requestCalendars } from "./api";

const getCalendars = () => requestCalendars.get<ICalendar[]>('');

const createCalendar = (calendarData: ICalendarCreate) => requestCalendars.post<ICalendar>('', calendarData);

export default {
  getCalendars,
  createCalendar
} 