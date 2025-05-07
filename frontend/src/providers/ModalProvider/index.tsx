import React, { FC } from "react";
import { useModal } from "hooks/useModal";
import { ModalCreateEvent, ModalDayInfo, ModalEditEvent, ModalViewEvent } from "components/common/modals";
import ModalEditCalendar from "components/common/modals/modal-edit-calendar/ModalEditCalendar";

export const ModalProvider: FC = ({ children }) => {
  const {
    isOpenModalCreateEvent,
    isOpenModalEditEvent,
    isOpenModalDayInfoEvents,
    isOpenModalEditCalendar,
    isOpenModalViewEvent,
    selectedDate,
    modalEditEventOptions,
    modalCreateEventOptions,
    modalEditCalendarOptions,
    modalViewEventOptions
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
        <ModalEditCalendar {...modalEditCalendarOptions}
        />
      )}
      {isOpenModalViewEvent && modalViewEventOptions && (
        <ModalViewEvent eventId={modalViewEventOptions.eventId} />
      )}
      {children}
    </>
  );
};
