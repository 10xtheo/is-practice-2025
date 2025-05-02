import React, { FC } from "react";
import { shmoment } from "utils/date";
import { getMapEventValues } from "../helpers";
import { IModalCreateEventOptions } from 'store/modals/types';
import ModalFormEvent from "../modal-form-event/ModalFormEvent";
import { useActions, useModal } from "hooks/index";

const ModalCreateEvent: FC<IModalCreateEventOptions> = ({
  selectedDate,
}) => {
  const { createEvent } = useActions();
  const { closeModalCreate } = useModal();
  const endDate = shmoment(selectedDate).add('hours', 1).result();

  const defaultEventValues = getMapEventValues({
    title: '',
    description: '',
    startDate: selectedDate,
    endDate,
    category_id: '',
    participants: []
  });

  return (
    <ModalFormEvent
      textSendButton="Создать событие"
      textSendingBtn="Создание.."
      defaultEventValues={defaultEventValues}
      closeModal={() => {
        closeModalCreate();
        window["selectedUsers"] = [];
      }}
      handlerSubmit={createEvent}
    />
  )
}

export default ModalCreateEvent;