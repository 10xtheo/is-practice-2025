import { IMonthDay } from 'types/date';
import { IEvent } from 'types/event';
import { shmoment } from 'utils/date';
import { checkIsEventsShowInCurrentInterval } from './checkIsEventsShowInCurrentInterval';

export const getEventsInterval = (daysInterval: IMonthDay[], events: IEvent[]) => {
	const eventsInterval = events.filter((event) => {
		const firstDayInInterval = daysInterval[0].date.getTime();
		const lastDayInInterval = shmoment(daysInterval[daysInterval.length - 1].date)
			.add('hours', 23)
			.add('minutes', 59)
			.result()
			.getTime();

		return checkIsEventsShowInCurrentInterval(firstDayInInterval, lastDayInInterval, event.start, event.end);
	});

	return eventsInterval;
};
