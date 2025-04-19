import React, { FC, useState, useEffect } from 'react';
import { ICalendar } from 'types/calendar';
import apiCalendars from 'gateway/calendars';
import './CalendarsList.scss';

const CalendarsList: FC = () => {
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      const data = await apiCalendars.getCalendars();
      setCalendars(data);
    };

    fetchCalendars();
  }, []);

  return (
    <div className="calendars-list">
      <div className="calendars-list__header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>Доступные календари</span>
        <div className="calendars-list__controls">
          <button className="calendars-list__add-btn">
            <i className="fas fa-plus"></i>
          </button>
          <button className="calendars-list__toggle-btn">
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="calendars-list__items">
          {calendars.map(calendar => (
            <div key={calendar.id} className="calendars-list__item">
              <input type="checkbox" id={`calendar-${calendar.id}`} />
              <label htmlFor={`calendar-${calendar.id}`}>
                <span 
                  className="calendars-list__color-indicator" 
                  style={{ backgroundColor: calendar.color }}
                />
                {calendar.title}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarsList; 