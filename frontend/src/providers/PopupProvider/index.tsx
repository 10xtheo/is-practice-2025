import React, { FC } from "react";
import { usePopup } from "hooks/usePopup";
import Popup from "components/common/popup/Popup";
import CalendarPopup from "components/common/popup/CalendarPopup";

export const PopupProvider: FC = ({ children }) => {
  const { isOpenPopup, popupOptions } = usePopup();

  return (
    <>
      {isOpenPopup && popupOptions?.eventId && (
        <Popup
          x={popupOptions.x}
          y={popupOptions.y}
          eventId={popupOptions.eventId}
        />
      )}
      {isOpenPopup && popupOptions?.calendarId && (
        <CalendarPopup
          x={popupOptions.x}
          y={popupOptions.y}
          calendarId={popupOptions.calendarId}
        />
      )}
      {children}
    </>
  );
};
