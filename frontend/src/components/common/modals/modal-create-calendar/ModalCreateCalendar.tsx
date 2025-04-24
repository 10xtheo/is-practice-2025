import React, { FC, useState } from 'react';
import { ICalendarCreate, TPartialCalendar } from 'types/calendar';
import './ModalCreateCalendar.scss';
import { TSubmitHandler } from 'hooks/useForm/types';
import { IModalValuesCalendar } from '../types';
import { useForm } from 'hooks/useForm';

interface ModalCreateCalendarProps {
  isOpen: boolean;
  closeModal: () => void;
  handlerSubmit: (calendarData: TPartialCalendar) => void;
}

const ModalCreateCalendar: FC<ModalCreateCalendarProps> = ({ isOpen, closeModal, handlerSubmit }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#FF5733');

  const { values, handleChange, handleSubmit, setValue, errors, submitting } = useForm<IModalValuesCalendar>({
    defaultValues: {
      title: '',
      color: '#FF5733',
    },
    // rules: createEventSchema @TODO добавить валидацию
  });

  const onSubmit: TSubmitHandler<IModalValuesCalendar> = async (data) => {
    const newCalendar: ICalendarCreate = {
      title: data.title,
      color: data.color,
    };
    
    try {      
      await handlerSubmit(newCalendar);
      closeModal();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  if (!isOpen) return null;

  const onChangeTitle = (title: string) => {
    setValue('title', title);
  }

  const onChangeColor = (color: string) => {
    setValue('color', color);
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Создать новый календарь</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="title">Название</label>
            <input
              type="text"
              id="title"
              value={values.title}
              onChange={(e) => onChangeTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Цвет</label>
            <input
              type="color"
              id="color"
              value={values.color}
              onChange={(e) => onChangeColor(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeModal}>Отмена</button>
            <button type="submit">Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateCalendar; 