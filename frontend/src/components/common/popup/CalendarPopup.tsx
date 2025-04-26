import React, { FC, useRef } from 'react';
import { useActions, useClickOutside, useModal, usePopup, useTypedSelector, useWindowSize } from 'hooks/index';

import styles from './popup.module.scss';

interface IPopupProps {
  x: number;
  y: number;
  calendarId: string;
}

const Popup: FC<IPopupProps> = ({ x, y, calendarId }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { calendars } = useTypedSelector(({ calendars }) => calendars);
  const { deleteCalendar } = useActions();
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
      top,
      zIndex: 1001
    }
  } 

  const handleClosePopup = () => closePopup();

  useClickOutside(popupRef, handleClosePopup);

  const onDelete = async () => {
    await deleteCalendar(calendarId);
    closePopup();
  }

  const handleOpenEditEventModal = () => {
    const calendarData = calendars.find((calendar) => calendar.id === calendarId);
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
          onClick={handleOpenEditEventModal}
        >
          <span className="delete-event-btn__icon">
            <i className="fas fa-edit"></i>
          </span>
          <span className={styles.btn__action__text}>
            Изменить
          </span>
        </button>
        <button
          className={styles.btn__action}
          onClick={onDelete}
        >
          <span className="delete-event-btn__icon">
            <i className="fas fa-trash"></i>
          </span>
          <span className={styles.btn__action__text}>
            Удалить
          </span>
        </button>
      </div>
  );
};

export default Popup;
