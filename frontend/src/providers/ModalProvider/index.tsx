import React, { FC } from "react";
import { useModal } from "hooks/useModal";
import { ModalCreateEvent, ModalDayInfo, ModalEditEvent } from "components/common/modals";
import ModalEditCalendar from "components/common/modals/modal-edit-calendar/ModalEditCalendar";

export const ModalProvider: FC = ({ children }) => {
  const {
    isOpenModalCreateEvent,
    isOpenModalEditEvent,
    isOpenModalDayInfoEvents,
    isOpenModalEditCalendar,
    selectedDate,
    modalEditEventOptions,
    modalCreateEventOptions,
    modalEditCalendarOptions
  } = useModal();

  return (
    <>
      {isOpenModalCreateEvent && (
        <ModalCreateEvent {...modalCreateEventOptions} />
      )}
      {isOpenModalEditEvent && (
        <ModalEditEvent {...modalEditEventOptions} />
      )}
      {isOpenModalDayInfoEvents && (
        <ModalDayInfo selectedDate={selectedDate} />
      )}
      {isOpenModalEditCalendar && (
        <ModalEditCalendar {...modalEditCalendarOptions} />
      )}
      {children}
    </>
  );
};
