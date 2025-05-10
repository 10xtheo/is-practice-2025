import React, { FC, useState } from 'react';
import './NotificationsList.scss';
import { Notification, removeNotification } from 'utils/notifications';
import { useModal } from 'hooks/useModal';
import { useTypedSelector } from 'hooks/useTypedSelector';

interface NotificationsListProps {
	notifications: Notification[];
	onNotificationsChange: (notifications: Notification[]) => void;
}

const NotificationsList: FC<NotificationsListProps> = ({ notifications, onNotificationsChange }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const { openModalEdit } = useModal();
	const { events } = useTypedSelector(({ events }) => events);

	const handleHideNotification = (id: string) => {
		const updatedNotifications = removeNotification(id);
		onNotificationsChange(updatedNotifications);
	};

	const handleNotificationClick = (notification: Notification) => {
		const eventData = events.find((event) => event.id === notification.eventId);
		if (eventData) {
			openModalEdit({ eventData, eventId: notification.eventId });
		}
	};

	return (
		<div className="notifications-list">
			<div className="notifications-list__header">
				<span>Уведомления</span>
				<div className="notifications-list__controls">
					<button className="notifications-list__toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
						<i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
					</button>
				</div>
			</div>
			{isExpanded && (
				<div className="notifications-list__items">
					{notifications.map((notification) => (
						<div
							key={notification.id}
							className="notifications-list__item"
							onClick={() => handleNotificationClick(notification)}
						>
							<div className="notifications-list__content">
								<div className="notifications-list__message">{notification.message}</div>
								<div className="notifications-list__timestamp">{notification.timestamp}</div>
							</div>
							<button
								className="notifications-list__hide-btn"
								onClick={(e) => {
									e.stopPropagation();
									handleHideNotification(notification.id);
								}}
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
