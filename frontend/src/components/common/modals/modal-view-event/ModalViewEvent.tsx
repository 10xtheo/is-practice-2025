import React, { FC, useRef } from "react";
import { useClickOutside, useModal, useTypedSelector } from "hooks/index";
import EventChat from 'components/common/EventChat';
import styles from "./modal-view-event.module.scss";

interface IModalViewEventProps {
  eventId: string;
}

const ModalViewEvent: FC<IModalViewEventProps> = ({
  eventId
}) => {
  const { closeModalView } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const { events } = useTypedSelector(({ events }) => events);
  const event = events.find(e => e.id === eventId);

  const handleCloseModal = () => closeModalView();
  
  useClickOutside(modalRef, handleCloseModal);

  if (!event) {
    return null;
  }

  return (
    <div style={{zIndex: 1200}} className="overlay">
      <div
        className={styles.modal}
        ref={modalRef}
        style={{ display: 'flex', flexDirection: 'row', minWidth: 800 }}
      >
        <div style={{ flex: 1, minWidth: 300, padding: '20px' }}>
          <button
            className={styles.modal__close}
            onClick={handleCloseModal}
          >
            <i className="fas fa-times"></i>
          </button>
          
          <h2 className={styles.modal__title}>{event.title}</h2>
          
          <div className={styles.modal__info}>
            <div className={styles.modal__info__item}>
              <strong>Время:</strong> {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
            </div>
            <div className={styles.modal__info__item}>
              <strong>Дата:</strong> {new Date(event.start).toLocaleDateString()}
            </div>
            {event.description && (
              <div className={styles.modal__info__item}>
                <strong>Описание:</strong>
                <p>{event.description}</p>
              </div>
            )}
            <div className={styles.modal__info__item}>
              <strong>Участники:</strong>
              <ul>
                {event.participants.map(participant => (
                  <li key={participant.id}>{participant.full_name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ width: 400, borderLeft: '1px solid #eee', padding: '20px' }}>
          <h3>Чат события</h3>
          <EventChat eventId={eventId} />
        </div>
      </div>
    </div>
  );
};

export default ModalViewEvent; 