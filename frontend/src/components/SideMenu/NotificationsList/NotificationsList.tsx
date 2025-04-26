import React, { FC, useState, useEffect } from 'react';
import './NotificationsList.scss';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface NotificationsListProps {
  notifications: Notification[];
}

const NotificationsList: FC<NotificationsListProps> = ({ notifications }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [notifications]);

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
              <div className="notifications-list__message">{notification.message}</div>
              <div className="notifications-list__timestamp">{notification.timestamp}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList; 