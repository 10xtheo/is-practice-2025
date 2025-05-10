import { IEvent } from 'types/event';
import { checkIsEventsShowInCurrentInterval } from './checkIsEventsShowInCurrentInterval';

export const getStyledByPositionXForEvent = (dayEvents: IEvent[], currentEvent: IEvent) => {
	const filteredEvents = dayEvents.filter((dayEvent) => {
		return checkIsEventsShowInCurrentInterval(currentEvent.start, currentEvent.end, dayEvent.start, dayEvent.end);
	});

	const sortedDayEvents = filteredEvents.sort((prevEvent, nextEvent) => {
		return prevEvent.start - nextEvent.start;
	});

	const eventIndx = sortedDayEvents.findIndex((event) => event.id === currentEvent.id);
	const eventsLength = sortedDayEvents.length;

	// All events align to the same right border
	const left = `calc(30% * ${eventIndx / eventsLength})`;
	const width = `calc(100% - ${left})`;

	return { left, width };
};
