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
      start: Date.now(),
      end: Date.now() + 1000 * 60 * 60 * 2,
      type: 'event',
      color: '#2196F3'
    },
    {
      id: '2',
      title: 'Lunch Break',
      description: 'Team lunch',
      start: Date.now() + 1000 * 60 * 60 * 2,
      end: Date.now() + 1000 * 60 * 60 * 3,
      type: 'event',
      color: '#4CAF50'
    },
    {
      id: '3',
      title: 'Project Deadline',
      description: 'Final submission',
      start: Date.now(),
      end: Date.now() + 1000 * 60 * 60 * 5,
      type: 'event',
      color: '#F44336'
    },
    {
      id: '4',
      title: 'Project Deadline',
      description: 'Final submission',
      start: Date.now() + 1000 * 60 * 60 * 24,
      end: Date.now() + 1000 * 60 * 60 * 25,
      type: 'event',
      color: '#F44336'
    }
  ];

  const weekEvents = getEventsInterval(weekDays, events);
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
