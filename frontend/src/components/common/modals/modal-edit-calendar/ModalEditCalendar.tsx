import React, { FC, useState } from 'react';
import { CategoryPermission, ICalendar } from 'types/calendar';
import { useActions, useModal } from 'hooks/index';
import { useTypedSelector } from 'hooks/index';
import './ModalEditCalendar.scss';
import { IServerUserCategoryParticipant, IServerUserParticipant } from "types/user";
import UserMultiSelector from 'components/user-multi-selector/UserMultiSelector';

interface IModalEditCalendarProps {
  calendarData: ICalendar;
  calendarId: string;
}

const ModalEditCalendar: FC<IModalEditCalendarProps> = ({
  calendarData,
  calendarId,
}) => {
  const { user } = useTypedSelector(({ users }) => users);
  const currentUser = user;
  const [title, setTitle] = useState(calendarData.title);
  // const [color, setColor] = useState(calendarData.color);
  const { updateCalendar, getCalendars, addCalendarParticipant, deleteCalendarParticipant } = useActions();
  const { closeModalEditCalendar } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCalendar({
      calendarId,
      calendarData: {
        title
      }
    });
    closeModalEditCalendar();
    window["selectedUsers"] = [];
    await getCalendars();
  };

  const handleClose = () => {
    closeModalEditCalendar();
    window["selectedUsers"] = [];
    getCalendars();
  };

  let prevParticipants: string[] = calendarData.participants.map(p => p.id);
  const handleParticipantsChange = async (users: { id: string }[]) => {
    // Предыдущее состояние содержало больше юзеров => нужно удаление
    if (prevParticipants.length > users.length) {
      for (const userId of prevParticipants.filter(pUserId => !users.find(user => user.id === pUserId))) {         
        if (userId === currentUser.id) {
          continue;
        }
        await deleteCalendarParticipant({ calendarId, userId });
      }
    } else {
      for (const user of users.filter(user => !prevParticipants.includes(user.id))) {         
        if (user.id === currentUser.id) {
          continue;
        }

        const participant: IServerUserCategoryParticipant = {
          user_id: user.id,
          is_creator: false,
          permissions: CategoryPermission.EDIT
        };
        await addCalendarParticipant({ calendarId, participant });
      }
    }

    prevParticipants = users.map(u => u.id);
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
          {/* <div className="modal-edit-calendar__field">
            <label htmlFor="color">Цвет</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div> */}
          <div className="form-group">
            <label htmlFor="title">Участники календаря</label>
            <UserMultiSelector
              onChange={(users) => {
                handleParticipantsChange(users);
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