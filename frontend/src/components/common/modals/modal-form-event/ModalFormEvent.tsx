import React, { ChangeEvent, FC, useRef } from 'react';
import { useClickOutside, useForm } from 'hooks/index';
import { checkDateIsEqual, getDateTime, getDifferenceInTimeFromTwoTimes, getDifferenceOfTwoDates, getDifferenceOfTwoTimestamps, shmoment } from 'utils/date';
import { TSubmitHandler } from 'hooks/useForm/types';
import { createEventSchema } from 'validation-schemas/index';
import { IModalValues } from './types';
import { TPartialEvent } from 'types/event';
import { TextField, DatePicker, TimePicker } from 'components/common/form-elements';
import cn from 'classnames';

import styles from './modal-form-event.module.scss';

interface IModalFormEventProps {
  textSendButton: string;
  textSendingBtn: string;
  defaultEventValues: IModalValues;
  closeModal: () => void;
  handlerSubmit: (eventData: TPartialEvent) => void;
}

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

  const isValid = Object.keys(errors).length === 0;
  
  const onSelectStartDate = (date: Date) => {
    if (values.isLongEvent) {
      const { minutes } = getDifferenceOfTwoTimestamps(values.start, values.end);
      const newEndDate = shmoment(date).add('minutes', minutes).result();
      
      setValue('end', newEndDate.getTime());
      setValue('start', date.getTime());
      return;
    }

    const oldStartDate = new Date(values.start);
    const newStartDate = new Date(date);
    const { minutes } = getDifferenceOfTwoTimestamps(values.start, values.end);
    const newEndDate = shmoment(newStartDate).add('minutes', minutes).result();

    setValue('end', newEndDate.getTime());
    setValue('start', newStartDate.getTime());
  }

  const onSelectEndDate = (date: Date) => {
    const endTime = values.isLongEvent ? '23:59' : new Date(values.end).toTimeString().slice(0, 5);
    setValue('end', getDateTime(date, endTime).getTime());
  }

  const onSelectStartTime = (time: string) => {
    const [startHours, startMins] = time.split(':');
    const { hours, minutes } = getDifferenceOfTwoDates(new Date(values.start), new Date(values.end));
    const restHourFromDiff = (+startMins + (minutes % 60)) >= 60  ? 1 : 0;
    
    const newEndMins = ((+startMins + minutes) % 60).toString().padStart(2, '0');
    const newEndHours = ((+startHours + Math.floor(hours) + restHourFromDiff) % 24).toString().padStart(2, '0');
    
    const newEndTime = `${newEndHours}:${newEndMins}`;
    const newEndDate = shmoment(getDateTime(new Date(values.start), time)).add('minutes', minutes).result();
    
    setValue('end', newEndDate.getTime());
    setValue('start', getDateTime(new Date(values.start), time).getTime());
  }

  const onSelectEndTime = (time: string) => {
    const isDatesEqual = checkDateIsEqual(new Date(values.start), new Date(values.end));
    const {
      minutes
    } = (isDatesEqual || !!errors.end)
    ? getDifferenceInTimeFromTwoTimes(new Date(values.start).toTimeString().slice(0, 5), time)
    : getDifferenceOfTwoDates(new Date(values.start), getDateTime(new Date(values.end), time));
    const newEndDate = shmoment(getDateTime(new Date(values.start), new Date(values.start).toTimeString().slice(0, 5))).add('minutes', minutes).result();

    setValue('end', newEndDate.getTime());
  }

  const onToggleIsLongEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const isLongEvent = e.target.checked;
    const startTime = isLongEvent ? '00:00' : new Date(values.start).toTimeString().slice(0, 5);
    const endTime = isLongEvent ? '23:59' : new Date(values.end).toTimeString().slice(0, 5);
    
    setValue('isLongEvent', isLongEvent);
    setValue('start', getDateTime(new Date(values.start), startTime).getTime());
    setValue('end', getDateTime(new Date(values.end), endTime).getTime());
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
      max_repeats_count: data.max_repeats_count
    };

    await handlerSubmit(newEvent);
    closeModal();
  }
  
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
              {!values.isLongEvent && (
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
              )}
              {values.isLongEvent && <div>-</div>}
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
            <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label htmlFor="type">
                <input
                  type="checkbox"
                  name="type"
                  id="type"
                  onChange={onToggleIsLongEvent}
                  checked={values.isLongEvent}
                />
                <span className={styles.modal__form__checkbox__title}>All day</span>
              </label>
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
                <span className={styles.modal__form__checkbox__title}>Private event</span>
              </label>
            </div>
            <div className={cn(styles.modal__form__group)}>
              <TextField
                type="number"
                name="repeat_step"
                placeholder="Repeat every X days (0 for no repeat)"
                onChange={onChangeRepeatStep}
                value={values.repeat_step}
                error={errors.repeat_step}
                className={styles.modal__form__input}
                fullWidth
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <TextField
                type="number"
                name="max_repeats_count"
                placeholder="Maximum number of repeats (0 for unlimited)"
                onChange={onChangeMaxRepeats}
                value={values.max_repeats_count}
                error={errors.max_repeats_count}
                className={styles.modal__form__input}
                fullWidth
              />
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