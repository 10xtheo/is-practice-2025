import React, { FC } from 'react';
import Day from '../day/Day';
import { IEvent } from 'types/event';
import { IMonthDay } from 'types/date';
import { shmoment } from 'utils/date';

import styles from './week.module.scss';

interface IWeekProps {
	events: IEvent[];
	weekDays: IMonthDay[];
}

const Week: FC<IWeekProps> = ({ events, weekDays }) => {
	return (
		<div className={styles.calendar__week}>
			{weekDays.map((day) => {
				const nextDay = shmoment(day.date).add('days', 1).result();

				const dayEvents = events?.filter((event) => {
					return event.start >= day.date.getTime() && event.end < nextDay.getTime();
				});

				const prevDayEvents = events.filter((event) => {
					return day.date.getTime() <= event.end && day.date.getTime() > event.start;
				});

				const nextDayEvents = events.filter((event) => {
					return nextDay.getTime() > event.start && nextDay.getTime() <= event.end;
				});

				return (
					<Day
						key={day.dayNumber}
						dayEvents={dayEvents}
						prevDayEvents={prevDayEvents}
						nextDayEvents={nextDayEvents}
						dayData={day}
					/>
				);
			})}
		</div>
	);
};

export default Week;
