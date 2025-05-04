import React, { FC, useEffect, useRef } from 'react';
import { useTypedSelector } from 'hooks/index';
import { IMonthDay, IWeekDay } from 'types/date';
import { getEventsInterval, getLongEvents, getShortEvents } from 'utils/helpers';
import Navigation from './components/navigation/Navigation';
import Week from './components/week/Week';
import Sidebar from './components/sidebar/Sidebar';
import LongEvents from './components/long-events/LongEvents';

import styles from './week-calendar.module.scss';

interface IWeekCalendarProps {
  weekDays: IMonthDay[];
  weekDaysNames: IWeekDay[];
  selectedCalendarIds: string[];
}

const WeekCalendar: FC<IWeekCalendarProps> = ({ weekDays, weekDaysNames, selectedCalendarIds }) => {
  let { events } = useTypedSelector(({ events }) => events);  
  
  events = events.filter(e => selectedCalendarIds.includes(e.category_id));
  
  const calendarBodyRef = useRef<HTMLDivElement>(null);

  const weekEvents = getEventsInterval(weekDays, events);
  const shortEvents = getShortEvents(weekEvents);
  const longEvents = getLongEvents(weekEvents);
  
  useEffect(() => {
    if (shortEvents.length > 0 && calendarBodyRef.current) {
      const firstEvent = shortEvents[0];
      const eventStartTime = new Date(firstEvent.start);
      const hour = eventStartTime.getHours();
      
      setTimeout(() => {
        const hourElement = calendarBodyRef.current.querySelector(`[data-time="${hour + 1}"]`);
        if (hourElement) {
          hourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [shortEvents]);
  
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
      <div className="calendar__body" ref={calendarBodyRef}>
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
