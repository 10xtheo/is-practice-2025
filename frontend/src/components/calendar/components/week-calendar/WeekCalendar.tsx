import React, { FC } from 'react';
import { useTypedSelector } from 'hooks/index';
import { IMonthDay, IWeekDay } from 'types/date';
import { getEventsInterval, getLongEvents, getShortEvents } from 'utils/helpers';
import Navigation from './components/navigation/Navigation';
import Week from './components/week/Week';
import Sidebar from './components/sidebar/Sidebar';
import LongEvents from './components/long-events/LongEvents';

import styles from './week-calendar.module.scss';
import { IEvent } from 'types/event';

interface IWeekCalendarProps {
  weekDays: IMonthDay[];
  weekDaysNames: IWeekDay[];
}

const WeekCalendar: FC<IWeekCalendarProps> = ({ weekDays, weekDaysNames }) => {
  // const { events } = useTypedSelector(({ events }) => events);
  const events: IEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly sync',
      start: '2025-04-18T10:00:00',
      end: '2025-04-18T11:00:00',
      type: 'event',
      color: '#2196F3'
    },
    {
      id: '2',
      title: 'Lunch Break',
      description: 'Team lunch',
      start: '2025-04-18T12:00:00',
      end: '2025-04-18T13:00:00',
      type: 'event',
      color: '#4CAF50'
    },
    {
      id: '3',
      title: 'Project Deadline',
      description: 'Final submission',
      start: '2025-04-19T09:00:00',
      end: '2025-04-19T17:00:00',
      type: 'event',
      color: '#F44336'
    }
  ];

  const weekEvents = getEventsInterval(weekDays, events);
  console.log('weekEvents', weekEvents);
  const shortEvents = getShortEvents(weekEvents);
  const longEvents = getLongEvents(weekEvents);
  
  return (
    <>
      <div className={styles.calendar__week__header__container}>
        <Navigation
          weekDays={weekDays}
          weekDaysNames={weekDaysNames}
        />
        <LongEvents
          weekDays={weekDays}
          events={longEvents}
        />
      </div>
      <div className="calendar__body">
        <div className={styles.calendar__week__container}>
          <Sidebar />
          <Week
            events={shortEvents}
            weekDays={weekDays}
          />
        </div>
      </div>
    </>
  );
}

export default WeekCalendar;
