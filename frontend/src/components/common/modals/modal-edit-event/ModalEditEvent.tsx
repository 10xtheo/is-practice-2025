import React, { FC } from "react";
import { getMapEventValues } from "../helpers";
import ModalFormEvent from "../modal-form-event/ModalFormEvent";
import { EventPermission, TPartialEvent } from "types/event";
import { useActions, useModal, useTypedSelector } from "hooks/index";
import { IModalEditEventOptions } from "store/modals/types";
import { IServerUserParticipant } from "types/user";
import { getEvents } from "store/events/actions";

const ModalEditEvent: FC<IModalEditEventOptions> = ({
  eventData,
  eventId
}) => {
  const { updateEvent, addEventParticipant, deleteEventParticipant } = useActions();
  const { closeModalEdit } = useModal();
  const { user } = useTypedSelector(({ users }) => users);
  const currentUser = user;
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
    .filter(p => !p.is_listener).map(participant => participant.id),
    listeners: eventData.participants
    .filter(p => p.is_listener).map(participant => participant.id),
    priority: eventData.priority,
    is_finished: eventData.is_finished,
    repeat_step: eventData.repeat_step,
    is_private: eventData.is_private,
    max_repeats_count: eventData.max_repeats_count,
  });
  
  const onUpdateEvent = (event: TPartialEvent) => {
    updateEvent({ eventId, event })
  };

  const handleParticipantsChange = async (users: { id: string }[]) => {
    const currentParticipants = eventData.participants.map(p => p.id);
    const newParticipants = users.map(u => u.id);

    // Добавляем новых участников
    const participantsToAdd = newParticipants.filter(id => !currentParticipants.includes(id));
    
    for (const userId of participantsToAdd) {
      if (userId === currentUser.id) {
        continue;
      }

      const participant: IServerUserParticipant = {
        user_id: userId,
        is_creator: false,
        is_listener: false,
        permissions: EventPermission.VIEW
      };
      await addEventParticipant({ eventId, participant });
    }

    // Удаляем участников, которых больше нет
    const participantsToRemove = currentParticipants.filter(id => !newParticipants.includes(id));
    
    for (const userId of participantsToRemove) { 
      if (userId === currentUser.id) {
        continue;
      }     
      await deleteEventParticipant({ eventId, userId });
    }
  };

  return (
    <ModalFormEvent
      textSendButton="Изменить"
      textSendingBtn="Изменение..."
      defaultEventValues={defaultEventValues}
      handlerSubmit={onUpdateEvent}
      onParticipantsChange={handleParticipantsChange}
      closeModal={async () => {
        closeModalEdit();
        await getEvents()
      }}
    />
  )
}

export default ModalEditEvent;