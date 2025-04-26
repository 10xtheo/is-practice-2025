import React, { FC, useState, useEffect } from 'react';
import './SideMenu.scss';
import Month from '../calendar/components/year-calendar/components/month/Month';
import { IMonthDay, IWeekDay, IMonth } from 'types/date';
import { getCalendarDaysOfMonth, getWeekDaysNames, createMonth, createDate } from 'utils/date';
import CalendarsList from './CalendarsList/CalendarsList';
import NotificationsList from './NotificationsList/NotificationsList';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectedCalendarsChange: (selectedIds: string[]) => void;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const SideMenu: FC<SideMenuProps> = ({ isOpen, onClose, onSelectedCalendarsChange }) => {  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentDate = new Date();
  const currentMonthObj = createMonth({ date: currentDate });
  const selectedDay = createDate({ date: currentDate });
  
  const currentMonth: IMonth = {
    month: currentMonthObj.monthName,
    monthShort: currentMonthObj.monthName.slice(0, 3),
    monthIndex: currentMonthObj.monthIndex,
    date: currentMonthObj.date
  };
  
  const weekDaysNames = getWeekDaysNames(1);
  const calendarDaysOfMonth = getCalendarDaysOfMonth({
    year: currentMonthObj.year,
    monthIndex: currentMonthObj.monthIndex,
    firstWeekDayNumber: 1,
    locale: 'en'
  });

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/echo?token=${localStorage.getItem('token')}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message,
        timestamp: new Date().toLocaleTimeString()
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    return () => {
      ws.close();
    };
  }, []);
  
  return (
    <div className={`side-menu ${isOpen ? 'side-menu--open' : ''}`}>
      <div className="side-menu__content">
        <div className="side-menu__calendar">
          <Month
            calendarDaysOfMonth={calendarDaysOfMonth}
            month={currentMonth}
            weekDaysNames={weekDaysNames}
            monthIndex={currentMonthObj.monthIndex}
            selectedDay={selectedDay}
            onChangeState={() => {}}
          />
        </div>
        <NotificationsList notifications={notifications} />
        <CalendarsList onSelectedCalendarsChange={onSelectedCalendarsChange} />
        <button className="side-menu__close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default SideMenu;