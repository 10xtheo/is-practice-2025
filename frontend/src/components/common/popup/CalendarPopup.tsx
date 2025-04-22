import React, { FC, useRef } from 'react';
import { useActions, useClickOutside, useModal, usePopup, useWindowSize } from 'hooks/index';
import { ICalendar } from 'types/calendar';

import styles from './popup.module.scss';

interface ICalendarPopupProps {
  x: number;
  y: number;
  calendarId: string;
  calendarData: ICalendar;
}

const CalendarPopup: FC<ICalendarPopupProps> = ({ x, y, calendarId, calendarData }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { deleteCalendar, getCalendars } = useActions();
  const { closePopup } = usePopup();
  const { openModalEditCalendar } = useModal();
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const getPopupStyle = () => {
    let popupHeight = 86;
    let popupWidth = 108;

    if (!!popupRef.current) {
      const { height, width } = getComputedStyle(popupRef.current);
      popupHeight = parseFloat(height);
      popupWidth = parseFloat(width);
    }

    const x2 = windowWidth - x - popupWidth;
    const y2 = windowHeight - y - popupHeight;

    const offsetX = x2 < 0 ? x - popupWidth : x;
    const offsetY = y2 < 0 ? y - popupHeight : y;

    const left = offsetX < 0 ? 0 : offsetX;
    const top = offsetY < 0 ? 0 : offsetY;

    return {
      left,
      top
    }
  } 

  const handleClosePopup = () => closePopup();

  useClickOutside(popupRef, handleClosePopup);

  const onDelete = async () => {
    await deleteCalendar(calendarId);
    await getCalendars();
    closePopup();
  }

  const handleOpenEditCalendarModal = () => {
    openModalEditCalendar({ calendarData, calendarId });
    closePopup();
  }

  return (
    <div
      className={styles.popup}
      ref={popupRef}
      style={getPopupStyle()}
    >
      <button
        className={styles.btn__action}
        onClick={onDelete}
      >
        <span className="delete-calendar-btn__icon">
          <i className="fas fa-trash"></i>
        </span>
        <span className={styles.btn__action__text}>
          Delete
        </span>
      </button>
      <button
        className={styles.btn__action}
        onClick={handleOpenEditCalendarModal}
      >
        <span className="edit-calendar-btn__icon">
          <i className="fas fa-edit"></i>
        </span>
        <span className={styles.btn__action__text}>
          Edit
        </span>
      </button>
    </div>
  );
};

export default CalendarPopup; 