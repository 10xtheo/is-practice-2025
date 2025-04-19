import { ICalendar } from "types/calendar";
import { requestCalendars } from "./api";

const getCalendars = () => requestCalendars.get<ICalendar[]>('');

export default {
  getCalendars
} 