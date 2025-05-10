import { ICalendar } from 'types/calendar';

export interface ICalendarsState {
	calendars: ICalendar[];
	selectedCalendarIds: string[];
}
