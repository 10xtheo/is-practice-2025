import React, { FC, useState } from 'react';
import { ICalendar } from 'types/calendar';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useActions } from 'hooks/useActions';
import ModalCreateCalendar from 'components/common/modals/modal-create-calendar/ModalCreateCalendar';
import './CalendarsList.scss';

interface CalendarsListProps {
  onSelectedCalendarsChange: (selectedIds: string[]) => void;
}

const CalendarsList: FC<CalendarsListProps> = ({ onSelectedCalendarsChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { calendars, selectedCalendarIds } = useTypedSelector(({ calendars }) => calendars);
  const { createCalendar, setSelectedCalendars } = useActions();

  const handleCalendarCreated = (newCalendar: ICalendar) => {
    createCalendar(newCalendar);
  };

  const handleCalendarSelect = (calendarId: string) => {
    const newSelectedIds = selectedCalendarIds.includes(calendarId)
      ? selectedCalendarIds.filter(id => id !== calendarId)
      : [...selectedCalendarIds, calendarId];
    
    setSelectedCalendars(newSelectedIds);
    onSelectedCalendarsChange(newSelectedIds);
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
                onChange={() => handleCalendarSelect(calendar.id)}
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