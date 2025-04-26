import React, { FC, useState, useEffect } from 'react';
import './NotificationsList.scss';
import { Notification, removeNotification } from 'utils/notifications';

interface NotificationsListProps {
  notifications: Notification[];
  onNotificationsChange: (notifications: Notification[]) => void;
}

const NotificationsList: FC<NotificationsListProps> = ({ notifications, onNotificationsChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleHideNotification = (id: string) => {
    const updatedNotifications = removeNotification(id);
    onNotificationsChange(updatedNotifications);
  };

  return (
    <div className={`notifications-list ${isAnimating ? 'notifications-list--animate' : ''}`}>
      <div className="notifications-list__header">
        <span>Уведомления</span>
        <div className="notifications-list__controls">
          <button 
            className="notifications-list__toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="notifications-list__items">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className="notifications-list__item"
            >
              <div className="notifications-list__content">
                <div className="notifications-list__message">{notification.message}</div>
                <div className="notifications-list__timestamp">{notification.timestamp}</div>
              </div>
              <button 
                className="notifications-list__hide-btn"
                onClick={() => handleHideNotification(notification.id)}
                title="Скрыть уведомление"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList; 