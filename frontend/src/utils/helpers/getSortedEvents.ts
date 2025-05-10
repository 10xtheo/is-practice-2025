import { IEvent } from 'types/event';

export const getSortedEvents = (events: IEvent[]) => {
	const sortedEvents = events.sort((prevEvent, nextEvent) => {
		return prevEvent.start - nextEvent.start;
	});

	return sortedEvents;
};
