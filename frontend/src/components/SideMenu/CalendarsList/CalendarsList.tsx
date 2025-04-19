import React, { FC, useState, useEffect } from 'react';
import { ICalendar } from 'types/calendar';
import apiCalendars from 'gateway/calendars';
import ModalCreateCalendar from 'components/common/modals/modal-create-calendar/ModalCreateCalendar';
import './CalendarsList.scss';

interface CalendarsListProps {
  onSelectedCalendarsChange: (selectedIds: string[]) => void;
}

const CalendarsList: FC<CalendarsListProps> = ({ onSelectedCalendarsChange }) => {
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      const data = await apiCalendars.getCalendars();
      setCalendars(data);
      // Select all calendars by default
      const allIds = data.map(calendar => calendar.id);
      setSelectedCalendarIds(allIds);
      onSelectedCalendarsChange(allIds);
    };

    fetchCalendars();
  }, [onSelectedCalendarsChange]);

  const handleCalendarCreated = (newCalendar: ICalendar) => {
    setCalendars(prev => [...prev, newCalendar]);
    // Add new calendar to selected calendars
    setSelectedCalendarIds(prev => {
      const newSelected = [...prev, newCalendar.id];
      onSelectedCalendarsChange(newSelected);
      return newSelected;
    });
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendarIds(prev => {
      const newSelected = prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId];
      onSelectedCalendarsChange(newSelected);
      return newSelected;
    });
  };

  return (
    <div className="calendars-list">
      <div className="calendars-list__header">
        <span>Доступные календари</span>
        <div className="calendars-list__controls">
          <button 
            className="calendars-list__add-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className="calendars-list__toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="calendars-list__items">
          {calendars.map(calendar => (
            <div key={calendar.id} className="calendars-list__item">
              <input 
                type="checkbox" 
                id={`calendar-${calendar.id}`}
                checked={selectedCalendarIds.includes(calendar.id)}
                onChange={() => handleCalendarToggle(calendar.id)}
              />
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
      <ModalCreateCalendar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCalendarCreated={handleCalendarCreated}
      />
    </div>
  );
};

export default CalendarsList;