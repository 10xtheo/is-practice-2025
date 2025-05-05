import React, { FC } from "react";
import { getMapEventValues } from "../helpers";
import ModalFormEvent from "../modal-form-event/ModalFormEvent";
import { TPartialEvent } from "types/event";
import { useActions, useModal } from "hooks/index";
import { IModalEditEventOptions } from "store/modals/types";


const ModalEditEvent: FC<IModalEditEventOptions> = ({
  eventData,
  eventId
}) => {
  const { updateEvent } = useActions();
  const { closeModalEdit } = useModal();
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
    participants: eventData.participants.map(participant => participant.id),
    priority: eventData.priority,
    repeat_step: eventData.repeat_step,
    is_private: eventData.is_private,
    max_repeats_count: eventData.max_repeats_count,
  });
  
  const onUpdateEvent = (event: TPartialEvent) => {
    updateEvent({ eventId, event })
  };

  return (
    <ModalFormEvent
      textSendButton="Изменить"
      textSendingBtn="Изменение..."
      defaultEventValues={defaultEventValues}
      handlerSubmit={onUpdateEvent}
      closeModal={() => {
        closeModalEdit();
        window["selectedUsers"] = [];
      }}
    />
  )
}

export default ModalEditEvent;