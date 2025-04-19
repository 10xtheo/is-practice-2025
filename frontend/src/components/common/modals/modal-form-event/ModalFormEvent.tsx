import React, { ChangeEvent, FC, useRef, useState } from 'react';
import { useClickOutside, useForm } from 'hooks/index';
import { checkDateIsEqual, getDateTime, getDifferenceInTimeFromTwoTimes, getDifferenceOfTwoDates, getDifferenceOfTwoTimestamps, shmoment } from 'utils/date';
import { TSubmitHandler } from 'hooks/useForm/types';
import { createEventSchema } from 'validation-schemas/index';
import { IModalValues } from './types';
import { TPartialEvent, EEventTypes, EEventPriority } from 'types/event';
import { TextField, DatePicker, TimePicker, ColorPicker, Select } from 'components/common/form-elements';
import cn from 'classnames';

import styles from './modal-form-event.module.scss';

interface IModalFormEventProps {
  textSendButton: string;
  textSendingBtn: string;
  defaultEventValues: IModalValues;
  closeModal: () => void;
  handlerSubmit: (eventData: TPartialEvent) => void;
}

const EVENT_REPEAT_INTERVALS = [
  { label: 'Час', value: 'hour', hours: 1 },
  { label: 'День', value: 'day', hours: 24 },
  { label: 'Месяц', value: 'month', hours: 24 * 30 },
  { label: 'Год', value: 'year', hours: 24 * 365 },
];

const ModalFormEvent: FC<IModalFormEventProps> = ({
  textSendButton,
  textSendingBtn,
  closeModal,
  defaultEventValues,
  handlerSubmit
}) => {
  const modalRef = useRef<HTMLDivElement>();

  const { values, handleChange, handleSubmit, setValue, errors, submitting } = useForm<IModalValues>({
    defaultValues: defaultEventValues,
    rules: createEventSchema
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [intervalType, setIntervalType] = useState('day');
  const isValid = Object.keys(errors).length === 0;
  
  const onChangeRepeatStepValue = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    const interval = EVENT_REPEAT_INTERVALS.find(i => i.value === intervalType);
    const hours = value * (interval ? interval.hours : 24);
    setValue('repeat_step', hours);
  };

  const onChangeIntervalType = (e) => {
    const newType = e.target.value;
    setIntervalType(newType);
    const value = parseInt(document.getElementById('repeat_step_input').textContent, 10) || 0;
    const interval = EVENT_REPEAT_INTERVALS.find(i => i.value === newType);
    const hours = value * (interval ? interval.hours : 24);
    setValue('repeat_step', hours);
  };

  const onSelectStartDate = (date: Date) => {
    const { minutes } = getDifferenceOfTwoTimestamps(values.start, values.end);
    const newEndDate = shmoment(date).add('minutes', minutes).result();
    
    setValue('end', newEndDate.getTime());
    setValue('start', date.getTime());
  }

  const onSelectEndDate = (date: Date) => {
    const endTime = new Date(values.end).toTimeString().slice(0, 5);
    const newEndDate = getDateTime(date, endTime);
    setValue('end', newEndDate.getTime());
  }

  const onSelectStartTime = (time: string) => {
    const [startHours, startMins] = time.split(':');
    const { hours, minutes } = getDifferenceOfTwoDates(new Date(values.start), new Date(values.end));
    const restHourFromDiff = (+startMins + (minutes % 60)) >= 60  ? 1 : 0;
    
    const newEndMins = ((+startMins + minutes) % 60).toString().padStart(2, '0');
    const newEndHours = ((+startHours + Math.floor(hours) + restHourFromDiff) % 24).toString().padStart(2, '0');
    
    const newEndTime = `${newEndHours}:${newEndMins}`;
    const newStartDate = getDateTime(new Date(values.start), time);
    const newEndDate = shmoment(newStartDate).add('minutes', minutes).result();
    
    setValue('end', newEndDate.getTime());
    setValue('start', newStartDate.getTime());
  }

  const onSelectEndTime = (time: string) => {
    const isDatesEqual = checkDateIsEqual(new Date(values.start), new Date(values.end));
    const {
      minutes
    } = (isDatesEqual || !!errors.end)
    ? getDifferenceInTimeFromTwoTimes(new Date(values.start).toTimeString().slice(0, 5), time)
    : getDifferenceOfTwoDates(new Date(values.start), getDateTime(new Date(values.end), time));
    
    const newEndDate = shmoment(new Date(values.start)).add('minutes', minutes).result();
    setValue('end', newEndDate.getTime());
  }

  const onToggleIsPrivate = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('is_private', e.target.checked);
  }

  const onChangeRepeatStep = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setValue('repeat_step', isNaN(value) ? 0 : value);
  }

  const onChangeMaxRepeats = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setValue('max_repeats_count', isNaN(value) ? 0 : value);
  }

  const onChangeType = (value: string) => {
    setValue('type', value as EEventTypes);
  }

  const onChangePriority = (value: string) => {
    setValue('priority', value as EEventPriority);
  }

  const onChangeColor = (color: string) => {
    setValue('color', color);
  }

  const onSubmit: TSubmitHandler<IModalValues> = async (data) => {
    const newEvent: TPartialEvent = {
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      repeat_step: data.repeat_step,
      is_private: data.is_private,
      creator_id: data.creator_id,
      is_finished: false,
      max_repeats_count: data.max_repeats_count,
      type: data.type,
      priority: data.priority,
      color: data.color
    };
    
    try {
      await handlerSubmit(newEvent);
      closeModal();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  useClickOutside(modalRef, closeModal);
  
  return (
    <div className="overlay">
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modal__content}>
          <button
            className={styles.modal__content__close}
            onClick={closeModal}
          >
            <i className="fas fa-times"></i>
          </button>
          <form
            className={styles.modal__form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              type="text"
              name="title"
              placeholder="Title"
              onChange={handleChange}
              value={values.title}
              error={errors.title}
              className={styles.modal__form__title}
              fullWidth
            />
            <div className={cn(styles.modal__form__date, styles.modal__form__group)}>
              <DatePicker
                selectedDate={new Date(values.start)}
                selectDate={onSelectStartDate}
                error={errors.start}
              />
              <div className={styles.modal__form__time}>
                <TimePicker
                  timeFrom='00:00'
                  selectedTime={new Date(values.start).toTimeString().slice(0, 5)}
                  selectTime={onSelectStartTime}
                  isFullDay
                  error={errors.start}
                />
                <span>-</span>
                <TimePicker
                  timeFrom={new Date(values.start).toTimeString().slice(0, 5)}
                  selectedTime={new Date(values.end).toTimeString().slice(0, 5)}
                  selectTime={onSelectEndTime}
                  isToday={checkDateIsEqual(new Date(values.start), new Date(values.end))}
                  error={errors.end}
                />
              </div>
              <div>
                <DatePicker
                  selectedDate={new Date(values.end)}
                  selectDate={onSelectEndDate}
                  error={errors.end}
                />
              </div>
            </div>
            {(!!errors.start || !!errors.end) && (
              <div className={styles.modal__form__error}>
                {(errors.start ?? errors.end)}
              </div>
            )}
            <div className={cn(styles.modal__form__group)}>
              <Select
                name="type"
                value={values.type}
                onChange={onChangeType}
                options={Object.entries(EEventTypes).map(([key, value]) => ({
                  value: key,
                  label: value
                }))}
                placeholder="Тип события"
                error={errors.type}
                fullWidth
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <Select
                name="priority"
                value={values.priority}
                onChange={onChangePriority}
                options={Object.entries(EEventPriority).map(([key, value]) => ({
                  value: key,
                  label: value
                }))}
                placeholder="Приоритет"
                error={errors.priority}
                fullWidth
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <ColorPicker
                selectedColor={values.color}
                onChangeColor={onChangeColor}
              />
            </div>
            <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label htmlFor="is_private">
                <input
                  type="checkbox"
                  name="is_private"
                  id="is_private"
                  onChange={onToggleIsPrivate}
                  checked={values.is_private}
                />
                <span className={styles.modal__form__checkbox__title}>Приватное</span>
              </label>
            </div>
            <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(v => !v)}
                />
                <span className={styles.modal__form__checkbox__title}>Повторяющееся?</span>
              </label>
            </div>
            {/* Блок с полями повторения */}
            <div style={{ display: isRecurring ? 'block' : 'none' }}>
              <span className={styles.modal__form__group}>Повторять каждые</span>
              <div className={cn(styles.modal__form__group)} style={{ display: 'flex', gap: 8 }}>
                <input
                  id="repeat_step_input"
                  type="number"
                  min="1"
                  onChange={onChangeRepeatStepValue}
                  defaultValue={1}
                  style={{ width: 80 }}
                />
                <select value={intervalType} onChange={onChangeIntervalType}>
                  {EVENT_REPEAT_INTERVALS.map(i => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
              <span className={styles.modal__form__group}>Количество повторений (0 - бесконечно)</span>
              <div className={cn(styles.modal__form__group)}>
                <TextField
                  type="number"
                  name="max_repeats_count"
                  onChange={onChangeMaxRepeats}
                  value={values.max_repeats_count}
                  error={errors.max_repeats_count}
                  className={styles.modal__form__input}
                  fullWidth
                />
              </div>
            </div>
            <div className={cn(styles.modal__form__textarea__container, styles.modal__form__group)}>
              <textarea
                name="description"
                placeholder="Description"
                onChange={handleChange}
                value={values.description}
                className={styles.modal__form__textarea}
              />
            </div>
            <button
              type="submit"
              className={cn(styles.modal__form__submit, {
                [styles.modal__form__submit_disabled]: !isValid || submitting
              })}
              disabled={!isValid || submitting}
            >
              {submitting ? textSendingBtn : textSendButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalFormEvent;