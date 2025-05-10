import React, { FC, useState, useEffect } from 'react';
import { CategoryPermission, ICalendar } from 'types/calendar';
import { useActions, useModal } from 'hooks/index';
import { useTypedSelector } from 'hooks/index';
import './ModalEditCalendar.scss';
import { IServerUserCategoryParticipant } from "types/user";
import UserMultiSelector from 'components/user-multi-selector/UserMultiSelector';
import { requestCalendarParticipants } from 'gateway/api';
import { useDispatch } from "react-redux";
import apiCalendars from 'gateway/calendars';
import apiUsers from 'gateway/users';
import { store } from "store/store";

interface IModalEditCalendarProps {
  calendarData: ICalendar;
  calendarId: string;
}

interface IExtendedParticipant extends IServerUserCategoryParticipant {
  full_name: string;
}

const ModalEditCalendar: FC<IModalEditCalendarProps> = ({
  calendarData,
  calendarId,
}) => {
  const { user } = useTypedSelector(({ users }) => users);
  const currentUser = user;
  const dispatch = useDispatch<typeof store.dispatch>();
  const [title, setTitle] = useState(calendarData.title);
  const [participants, setParticipants] = useState<IExtendedParticipant[]>([]);
  const { updateCalendar, getCalendars, addCalendarParticipant, deleteCalendarParticipant } = useActions();
  const { closeModalEditCalendar } = useModal();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await apiCalendars.getParticipants(calendarId);
        const users = await apiUsers.getUsers();
        
        const extendedParticipants = response.data.map(p => {
          const user = users.data.find(u => u.id === p.user_id);
          return {
            ...p,
            full_name: user?.full_name || 'Unknown User'
          };
        });
        
        setParticipants(extendedParticipants);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    };

    fetchParticipants();
  }, [calendarId]);

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

  const handlePermissionChange = async (userId: string, newPermission: CategoryPermission) => {
    try {
      const participant = participants.find(p => p.user_id === userId);
      if (!participant) return;

      const updatedParticipant: Omit<IServerUserCategoryParticipant, 'user_id'> = {
        is_creator: participant.is_creator,
        permissions: newPermission
      };

      await requestCalendarParticipants.put(`/${calendarId}/participants/${userId}`, updatedParticipant);
      dispatch(getCalendars());
    } catch (error) {
      console.error('Failed to update participant permission:', error);
    }
  };

  const renderParticipantList = () => (
    <ul className="participants-list">
      {participants.map(participant => (
        <li key={participant.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <span>{participant.full_name}</span>
          <select
            value={participant.permissions}
            onChange={(e) => handlePermissionChange(participant.user_id, e.target.value as CategoryPermission)}
            style={{ marginLeft: 'auto' }}
          >
            <option value={CategoryPermission.VIEW}>Просмотр</option>
            <option value={CategoryPermission.EDIT}>Редактирование</option>
            <option value={CategoryPermission.MANAGE}>Управление</option>
          </select>
        </li>
      ))}
    </ul>
  );

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
          <div className="form-group">
            <label>Уровни доступа участников</label>
            {renderParticipantList()}
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