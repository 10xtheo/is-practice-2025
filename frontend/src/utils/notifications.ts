export interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 5;

export const getStoredNotifications = (): Notification[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addNotification = (notification: Notification): Notification[] => {
  const notifications = getStoredNotifications();
  const updatedNotifications = [notification, ...notifications].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
  return updatedNotifications;
};

export const removeNotification = (id: string): Notification[] => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.filter(notification => notification.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
  return updatedNotifications;
};

export const clearNotifications = (): void => {
  localStorage.removeItem(STORAGE_KEY);
}; 