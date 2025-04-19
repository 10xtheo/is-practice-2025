import React, { FC, useState } from 'react';
import { ICalendar } from 'types/calendar';
import apiCalendars from 'gateway/calendars';
import './ModalCreateCalendar.scss';

interface ModalCreateCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onCalendarCreated: (calendar: ICalendar) => void;
}

const ModalCreateCalendar: FC<ModalCreateCalendarProps> = ({ isOpen, onClose, onCalendarCreated }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#FF5733');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCalendar = await apiCalendars.createCalendar({
        title,
        color,
        owner_id: 'user1' // This should come from auth context in real app
      });
      onCalendarCreated(newCalendar);
      onClose();
    } catch (error) {
      console.error('Failed to create calendar:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Создать новый календарь</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Название</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Цвет</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateCalendar; 