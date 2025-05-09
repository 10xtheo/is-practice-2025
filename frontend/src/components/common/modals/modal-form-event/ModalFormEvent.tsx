import React, { ChangeEvent, FC, useRef, useState } from 'react';
import { useClickOutside, useForm, useTypedSelector } from 'hooks/index';
import { checkDateIsEqual, getDateTime, getDifferenceInTimeFromTwoTimes, getDifferenceOfTwoDates, getDifferenceOfTwoTimestamps, shmoment } from 'utils/date';
import { TSubmitHandler } from 'hooks/useForm/types';
import { IModalValues } from 'components/common/modals/types';
import { TPartialEvent, EventType, EventPriority, EventPermission, RepeatType } from 'types/event';
import { TextField, DatePicker, TimePicker, ColorPicker, Select } from 'components/common/form-elements';
import { getEventTypeOptions, getEventPriorityOptions, getEventRepeatTypeOptions } from '../helpers';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';
import { findAvailableTimeSlots } from 'store/events/actions';

import styles from './modal-form-event.module.scss';
import UserMultiSelector from 'components/user-multi-selector/UserMultiSelector';
import { getEvents } from 'store/events/actions';

interface IModalFormEventProps {
  textSendButton: string;
  textSendingBtn: string;
  defaultEventValues: IModalValues;
  closeModal: () => void;
  handlerSubmit: (eventData: TPartialEvent) => void;
  onParticipantsChange?: (users: { id: string }[]) => void;
  onListenersChange?: (users: { id: string }[]) => void;
}

const ModalFormEvent: FC<IModalFormEventProps> = ({
  textSendButton,
  textSendingBtn,
  closeModal,
  defaultEventValues,
  handlerSubmit,
  onParticipantsChange,
  onListenersChange,
}) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const modalRef = useRef<HTMLDivElement>(null);
  const { calendars } = useTypedSelector(({ calendars }) => calendars);
  const { users, user } = useTypedSelector(({ users }) => users);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const currentUser = user;

  const { values, handleChange, handleSubmit, setValue, errors, submitting } = useForm<IModalValues>({
    defaultValues: defaultEventValues,
    // rules: createEventSchema @TODO добавить валидацию
  });

  const [isRecurring, setIsRecurring] = useState(defaultEventValues.repeat_type !== RepeatType.NONE);
  const isValid = Object.keys(errors).length === 0;
  
  const onChangeRepeatStepValue = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setValue('repeat_step', value);
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
  const onToggleIsFinished = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('is_finished', e.target.checked);
  }
  const onChangeMaxRepeats = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setValue('max_repeats_count', isNaN(value) ? 0 : value);
  }

  const onChangeType = (value: string) => {
    setValue('type', value as EventType);
  }

  const onChangePriority = (value: string) => {
    setValue('priority', value as EventPriority);
  }

  const onChangeRepeatType = (value: string) => {
    setValue('repeat_type', value as RepeatType);
  }


  const onChangeCategoryValue = (category_id: string) => {
    const calendar = calendars.find(i => i.id === category_id);
    if (calendar) {
      setValue('category_id', category_id);
    } else {
      alert(`нет такой категории: ${category_id}`);
    }
  };

  const onSelectRepeatUntil = (date: Date) => {
    setValue('repeat_until', date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  };

  const onSubmit: TSubmitHandler<IModalValues> = async (data) => {
    let allParticipants = users
    .filter(user => data.participants.includes(user.id))
    .map(up => ({...up, 
      is_creator: up.id === currentUser.id, 
      is_listener: false, 
      permissions: up.id === currentUser.id ? EventPermission.ORGANIZE : EventPermission.EDIT}))
    if (data.listeners) {
      users.filter(user => data.listeners.includes(user.id))
      .map(up => ({...up, is_creator: up.id === currentUser.id, is_listener: true}))
      .forEach(u => {
        if (!allParticipants.find(up => up.id === u.id) && u.id !== currentUser.id) {
          allParticipants.push({...u, permissions: EventPermission.VIEW})
        }
      })
    }
    
    allParticipants.splice(allParticipants.findIndex(u => u.id === currentUser.id), 1)
    
    const newEvent: TPartialEvent = {
      title: data.title,
      description: data.description,
      start: data.start - new Date(data.start).getTimezoneOffset() * 60 * 1000,
      end: data.end - new Date(data.end).getTimezoneOffset() * 60 * 1000,
      repeat_step: data.repeat_step,
      repeat_type: data.repeat_type,
      repeat_until: isRecurring ? data.repeat_until : Date.now(),
      is_private: data.is_private,
      is_finished: data.is_finished,
      max_repeats_count: data.max_repeats_count,
      type: data.type,
      priority: data.priority,
      // color: data.color,
      category_id: data.category_id,
      participants: allParticipants,
    };
    
    try {      
      await handlerSubmit(newEvent);
      closeModal();
      window["selectedUsers"] = [];
      window["listenerUsers"] = [];
      await dispatch(getEvents());
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  const handleFindAvailableTime = async () => {
    if (!values.participants.length) {
      alert('Please select participants first');
      return;
    }

    setIsLoadingTimeSlots(true);
    try {
      const durationMinutes = Math.round((values.end - values.start) / (1000 * 60));
      
      const slots = await dispatch(findAvailableTimeSlots({
        duration_minutes: durationMinutes,
        participant_ids: values.participants,
        start_date: new Date(values.start - new Date(values.start).getTimezoneOffset() * 60 * 1000).toISOString(),
        end_date: new Date(values.end - new Date(values.end).getTimezoneOffset() * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString()
      })).unwrap();

      if (slots.length > 100) {
        setAvailableTimeSlots(slots.filter((slot, idx) => {
          if (idx % 30 == 0) return slot;
        }));
      } else if (slots.length > 30) {
        setAvailableTimeSlots(slots.filter((slot, idx) => {
          if (idx % 10 == 0) return slot;
        }));
      } else {
        setAvailableTimeSlots(slots);
      }
      
    } catch (error) {
      console.error('Error finding available time slots:', error);
      alert('Failed to find available time slots');
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const handleSelectTimeSlot = (slot: string) => {
    const slotDate = new Date(slot);
    const duration = values.end - values.start;
    const newEndDate = new Date(slotDate.getTime() + duration);
    
    setValue('start', slotDate.getTime());
    setValue('end', newEndDate.getTime());
    setAvailableTimeSlots([]);
  };

  useClickOutside(modalRef, closeModal);
  
  return (
    <div className="overlay" style={{ zIndex: 1002 }}>
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
              required
              type="text"
              name="title"
              placeholder="Название"
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
                options={getEventTypeOptions()}
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
                options={getEventPriorityOptions()}
                placeholder="Приоритет"
                error={errors.priority}
                fullWidth
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <Select
                name="category"
                value={values.category_id}
                onChange={onChangeCategoryValue}
                options={calendars.map(calendar => ({
                  value: calendar.id,
                  label: calendar.title
                }))}
                placeholder="Календарь"
                error={errors.category_id}
                fullWidth
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <label>Участники</label>
              <UserMultiSelector
                defaultSelectedUsers={defaultEventValues.participants.length > 0 
                  ? defaultEventValues.participants 
                  : [user.id]}
                onChange={(users) => {
                  setValue('participants', users.map(user => user.id));
                  onParticipantsChange?.(users);
                }}
              />
            </div>
            <div className={cn(styles.modal__form__group)}>
              <label>Информируемые лица</label>
              <UserMultiSelector
                defaultSelectedUsers={defaultEventValues.listeners || []}
                storageName='listenerUsers
                '
                onChange={(users) => {
                  setValue('listeners', users.map(user => user.id));
                  onListenersChange?.(users);
                }}
                placeholder="Выберите информируемых лиц..."
              />
            </div>
            {/* {values.color !== 'rgb(255, 255, 255)' && (<div className={cn(styles.modal__form__group)}>
              <ColorPicker
                selectedColor={values.color}
                // onChangeColor={onChangeColor}
                onChangeColor={() => {}}
              />
            </div>)} */}

             <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label htmlFor="is_finished">
                <input
                  type="checkbox"
                  name="is_finished"
                  id="is_finished"
                  onChange={onToggleIsFinished}
                  checked={values.is_finished}
                />
                <span className={styles.modal__form__checkbox__title}>Завершено?</span>
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
                <span className={styles.modal__form__checkbox__title}>Приватное?</span>
              </label>
            </div>
            <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(v => {
                    if (v) {
                      setValue('repeat_step', 0);
                      setValue('max_repeats_count', 0);
                      setValue('repeat_type', RepeatType.NONE);
                      setValue('repeat_until', Date.now());
                    }
                    return !v
                  })}
                />
                <span className={styles.modal__form__checkbox__title}>Повторяющееся?</span>
              </label>
            </div>
            <div style={{ display: isRecurring ? 'block' : 'none' }}>
              <span className={styles.modal__form__group}>Интервал повторения</span>
              <div className={cn(styles.modal__form__group)} style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                <input
                  id="repeat_step_input"
                  type="number"
                  min={defaultEventValues.repeat_step === 0 ? 0 : 1}
                  onChange={onChangeRepeatStepValue}
                  defaultValue={defaultEventValues.repeat_step}
                  style={{ width: 80, height: 36 }}
                />
                <Select
                  name="repeat_type"
                  value={values.repeat_type}
                  onChange={onChangeRepeatType}
                  options={getEventRepeatTypeOptions()}
                  placeholder="Шаг повторения"
                  error={errors.repeat_type}
                />
              </div>
              <span className={styles.modal__form__group}>Повторять до</span>
              <div className={cn(styles.modal__form__group)}>
                <DatePicker
                  selectedDate={values.repeat_until ? new Date(values.repeat_until) : new Date()}
                  selectDate={onSelectRepeatUntil}
                  error={errors.repeat_until}
                />
              </div>
            </div>
            <div className={cn(styles.modal__form__textarea__container, styles.modal__form__group)}>
              <textarea
                name="description"
                placeholder="Описание"
                onChange={handleChange}
                value={values.description}
                className={styles.modal__form__textarea}
              />
            </div>
            <div style={{paddingBottom: 20}}className={cn(styles.modal__form__group)}>
              <button
                type="button"
                style={{width: '100%', display: 'block'}}
                className={cn(styles.navigation__today__btn, "button")}
                onClick={handleFindAvailableTime}
                disabled={isLoadingTimeSlots}
              >
                {isLoadingTimeSlots ? 'Поиск...' : 'Найти свободный слот'}
              </button>
            </div>

            {availableTimeSlots.length > 0 && (
              <div className={cn(styles.modal__form__group)}>
                <h4>Свободные слоты:</h4>
                <div className={styles.modal__form__time_slots}>
                  {availableTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className={styles.modal__form__time_slot}
                      onClick={() => handleSelectTimeSlot(slot)}
                    >
                      {new Date(slot).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className={cn(styles.navigation__today__btn, "button")}
              type="submit"
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