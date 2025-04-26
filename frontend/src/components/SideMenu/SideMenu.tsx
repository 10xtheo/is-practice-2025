import React, { FC, useState, useEffect, useRef } from 'react';
import './SideMenu.scss';
import Month from '../calendar/components/year-calendar/components/month/Month';
import { IMonthDay, IWeekDay, IMonth } from 'types/date';
import { getCalendarDaysOfMonth, getWeekDaysNames, createMonth, createDate } from 'utils/date';
import CalendarsList from './CalendarsList/CalendarsList';
import NotificationsList from './NotificationsList/NotificationsList';
import { Notification, getStoredNotifications, addNotification } from 'utils/notifications';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectedCalendarsChange: (selectedIds: string[]) => void;
}

const SideMenu: FC<SideMenuProps> = ({ isOpen, onClose, onSelectedCalendarsChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>(getStoredNotifications());
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const currentDate = new Date();
  const currentMonthObj = createMonth({ date: currentDate });
  const selectedDay = createDate({ date: currentDate });

  const currentMonth: IMonth = {
    month: currentMonthObj.monthName,
    monthShort: currentMonthObj.monthName.slice(0, 3),
    monthIndex: currentMonthObj.monthIndex,
    date: currentMonthObj.date,
  };

  const weekDaysNames = getWeekDaysNames(1);
  const calendarDaysOfMonth = getCalendarDaysOfMonth({
    year: currentMonthObj.year,
    monthIndex: currentMonthObj.monthIndex,
    firstWeekDayNumber: 1,
    locale: 'en',
  });

  const soundUrls = [
    "https://www.myinstants.com/media/sounds/vine-boom-sound-effect_KT89XIq.mp3",
    "https://www.myinstants.com/media/sounds/roblox-death-sound-effect.mp3",
    "https://www.myinstants.com/media/sounds/123444.mp3",
    "https://www.myinstants.com/media/sounds/pda_4LbLWWH.mp3",
    "https://www.myinstants.com/media/sounds/na-tvoi-telefon-prishlo-novoe-soobshchenie.mp3",
  ];

  // ээх звуки звучки..
  const playNotificationSound = () => {
    try {
      // Останавливаем предыдущий звук, если он играет
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }

      // Создаем новый аудиоэлемент с случайным звуком
      const audio = new Audio(soundUrls[Math.floor(Math.random() * soundUrls.length)]);
      audio.volume = 0.25;

      // Обработчики событий для очистки ссылки на аудио
      audio.addEventListener('ended', () => {
        soundRef.current = null;
      });

      audio.addEventListener('error', (e) => {
        console.warn('Sound playback error:', e);
        soundRef.current = null;
      });

      // Запускаем воспроизведение
      audio.play().catch((error) => {
        console.warn('Audio play failed:', error);
      });

      soundRef.current = audio;
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/echo?token=${localStorage.getItem('token')}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        eventId: data.event_id
      };
      const updatedNotifications = addNotification(newNotification);
      setNotifications(updatedNotifications);
      playNotificationSound();
    };

    return () => {
      ws.close();
      // Останавливаем звук при размонтировании компонента
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, []);

  const handleNotificationsChange = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
  };

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
        <NotificationsList 
          notifications={notifications} 
          onNotificationsChange={handleNotificationsChange}
        />
        <CalendarsList onSelectedCalendarsChange={onSelectedCalendarsChange} />
        <button className="side-menu__close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default SideMenu;
