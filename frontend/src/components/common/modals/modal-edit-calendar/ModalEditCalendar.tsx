import React, { FC, useState } from 'react';
import { ICalendar } from 'types/calendar';
import { useActions, useModal } from 'hooks/index';
import { useTypedSelector } from 'hooks/index';
import './ModalEditCalendar.scss';
import UserMultiSelector from 'components/user-multi-selector/UserMultiSelector';

interface IModalEditCalendarProps {
  calendarData: ICalendar;
  calendarId: string;
}

const ModalEditCalendar: FC<IModalEditCalendarProps> = ({
  calendarData,
  calendarId
}) => {
  const { user } = useTypedSelector(({ users }) => users);
  const [title, setTitle] = useState(calendarData.title);
  const [color, setColor] = useState(calendarData.color);
  const { updateCalendar } = useActions();
  const { closeModalEditCalendar } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCalendar({
      calendarId,
      calendarData: {
        title,
        color,
        participants: window["selectedUsers"]
      }
    });
    closeModalEditCalendar();
    window["selectedUsers"] = [];
  };

  const handleClose = () => {
    closeModalEditCalendar();
    window["selectedUsers"] = [];
  };

  return (
    <div className="modal-edit-calendar">
      <div className="modal-edit-calendar__content">
        <h2 className="modal-edit-calendar__title">Редактировать календарь</h2>
        <form onSubmit={handleSubmit} className="modal-edit-calendar__form">
          <div className="modal-edit-calendar__field">
            <label htmlFor="title">Название</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="modal-edit-calendar__field">
            <label htmlFor="color">Цвет</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Участники календаря</label>
            <UserMultiSelector
              onChange={(users) => {
                console.log('onChange users', users);
              }}
              defaultSelectedUsers={calendarData.participants.map(participant => participant.id).length > 0 
                ? calendarData.participants.map(participant => participant.id)
                : [user.id]
              }
            />
          </div>
          <div className="modal-edit-calendar__actions">
            <button type="button" onClick={handleClose}>
              Отменить
            </button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditCalendar; 