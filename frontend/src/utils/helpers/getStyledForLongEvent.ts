import { IMonthDay } from 'types/date';
import { IEvent } from 'types/event';
import { checkDateIsEqual, getDateTime, shmoment } from 'utils/date';

export const getStyledForLongEvent = (daysInterval: IMonthDay[], day: IMonthDay, event: IEvent) => {
	const firstItem = daysInterval[0];
	const lastItem = daysInterval[daysInterval.length - 1];
	const startDate = getDateTime(new Date(event.start), '00:00');
	const endDate = getDateTime(new Date(event.end), '23:59');
	const firtDayOfNextInterval = shmoment(lastItem.date).add('days', 1).result();
	const lastDay = shmoment(lastItem.date).add('hours', 23).add('minutes', 59).result();

	const isStartDayEvent = checkDateIsEqual(day.date, startDate);
	const isEventMovingToNextInterval = firtDayOfNextInterval.getTime() < event.end;
	const isEventMovingFromPrevInterval =
		checkDateIsEqual(firstItem.date, day.date) && day.date.getTime() > event.start;

	let eventWidth = 1;
	let isShowEvent = true;

	if (isStartDayEvent) {
		if (isEventMovingToNextInterval) {
			const totalDiffInDays = Math.ceil((lastDay.getTime() - event.start) / (1000 * 60 * 60 * 24));
			eventWidth = totalDiffInDays % 7;
		} else {
			const totalDiffInDays = Math.ceil((event.end - event.start) / (1000 * 60 * 60 * 24));
			eventWidth = totalDiffInDays;
		}
	} else if (isEventMovingFromPrevInterval) {
		const isLastDate = lastDay.getTime() < event.end;
		const diffInDays = Math.ceil(
			(isLastDate ? lastDay.getTime() : event.end - day.date.getTime()) / (1000 * 60 * 60 * 24),
		);
		eventWidth = diffInDays;
	} else {
		isShowEvent = false;
	}

	return {
		width: eventWidth * 100,
		isShowEvent,
		isMovingToNext: isEventMovingToNextInterval,
		isMovingFromPrev: isEventMovingFromPrevInterval,
	};
};
