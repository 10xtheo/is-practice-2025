import React, { FC, useState } from "react";
import { getMapEventValues } from "../helpers";
import ModalFormEvent from "../modal-form-event/ModalFormEvent";
import { EventPermission, TPartialEvent } from "types/event";
import { useActions, useModal, useTypedSelector } from "hooks/index";
import { IModalEditEventOptions } from "store/modals/types";
import { IServerUserParticipant } from "types/user";
import { getEvents } from "store/events/actions";
import UserMultiSelector from "components/user-multi-selector/UserMultiSelector";
import styles from "./modal-edit-event.module.scss";

const ModalEditEvent: FC<IModalEditEventOptions> = ({
  eventData,
  eventId
}) => {
  const { updateEvent, addEventParticipant, deleteEventParticipant } = useActions();
  const { closeModalEdit } = useModal();
  const { users } = useTypedSelector(({ users }) => users);
  const [showListenerSelector, setShowListenerSelector] = useState(false);
  
  const startDate = new Date(eventData.start);
  const endDate = new Date(eventData.end);
  
  const defaultEventValues = getMapEventValues({
    title: eventData.title,
    description: eventData.description,
    startDate,
    endDate,
    type: eventData.type,
    color: eventData.color,
    category_id: eventData.category_id,
    participants: eventData.participants
      .filter(p => !p.is_listener)
      .map(participant => participant.id),
    listeners: eventData.participants
      .filter(p => p.is_listener)
      .map(participant => participant.id),
    priority: eventData.priority,
    is_finished: eventData.is_finished,
    repeat_step: eventData.repeat_step,
    is_private: eventData.is_private,
    max_repeats_count: eventData.max_repeats_count,
  });

  const onUpdateEvent = (event: TPartialEvent) => {
    updateEvent({ eventId, event });
  };

  const handleAddListener = (selectedUsers: any[]) => {
    selectedUsers.forEach(user => {
      const listener: IServerUserParticipant = {
        user_id: user.id,
        is_creator: false,
        is_listener: true,
        permissions: EventPermission.VIEW
      };
      addEventParticipant({ eventId, participant: listener });
    });
    setShowListenerSelector(false);
  };

  const handleRemoveListener = (userId: string) => {
    deleteEventParticipant({ eventId, userId });
  };

  const listeners = eventData.participants.filter(p => p.is_listener);
  const participants = eventData.participants.filter(p => !p.is_listener);

  return (
    <div className={styles.container}>
      <ModalFormEvent
        textSendButton="Изменить"
        textSendingBtn="Изменение..."
        defaultEventValues={defaultEventValues}
        handlerSubmit={onUpdateEvent}
        closeModal={closeModalEdit}
      />
      
      <div className={styles.listeners}>
        <h3>Информируемые лица</h3>
        <div className={styles.listeners__list}>
          {listeners.map(listener => (
            <div key={listener.id} className={styles.listener}>
              <span>{listener.full_name}</span>
              <button
                className={styles.listener__remove}
                onClick={() => handleRemoveListener(listener.id)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
        
        {showListenerSelector ? (
          <div className={styles.selector}>
            <UserMultiSelector
              onChange={handleAddListener}
              placeholder="Выберите информируемых лиц"
              defaultSelectedUsers={listeners.map(l => l.id)}
            />
            <button
              className={styles.selector__cancel}
              onClick={() => setShowListenerSelector(false)}
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            className={styles.listeners__add}
            onClick={() => setShowListenerSelector(true)}
          >
            Добавить информируемое лицо
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalEditEvent;