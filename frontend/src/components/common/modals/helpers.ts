import { IMapEventValues, IModalValues } from './types';
import { EventType, EventPriority } from 'types/event';
import { RepeatType } from 'types/event';

const formatEnumValue = (value: string): string => {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const formatRepeatTypeEnumValue = (value: RepeatType): string => {
	switch (value) {
    case RepeatType.NONE:
      return 'Не указано'
    case RepeatType.HOURLY:
      return 'Час'
    case RepeatType.DAILY:
      return 'День'
    case RepeatType.WEEKLY:
      return 'Неделя'
    case RepeatType.MONTHLY:
      return 'Месяц'
    case RepeatType.YEARLY:
      return 'Год'
    case RepeatType.RECURRING_PARENT:
      return 'Ключевое'
    case RepeatType.RECURRING_DUPLICATE:
      return 'Дочернее'
  }
};

export const getEventTypeOptions = () => {
	return Object.entries(EventType).map(([key, value]) => ({
		value: value,
		label: formatEnumValue(value),
	}));
};

export const getEventPriorityOptions = () => {
	return Object.entries(EventPriority).map(([key, value]) => ({
		value: value,
		label: formatEnumValue(value),
	}));
};

export const getEventRepeatTypeOptions = () => {
	return Object.entries(RepeatType)
		.map(([key, value]) => ({
			value: value,
			label: formatRepeatTypeEnumValue(value),
		}))
		.filter((el) => el.value !== RepeatType.RECURRING_DUPLICATE && el.value !== RepeatType.RECURRING_PARENT);
};

export const getEditEventRepeatTypeOptions = () => {
	return Object.entries(RepeatType)
		.map(([key, value]) => ({
			value: value,
			label: formatRepeatTypeEnumValue(value),
		}))
};

export const getMapEventValues = ({
	title,
	description,
	startDate,
	endDate,
	type = EventType.MEETING,
	priority = EventPriority.MEDIUM,
	is_private = false,
	is_finished = false,
	repeat_step = 0,
	repeat_type = RepeatType.NONE,
	repeat_until = null,
	max_repeats_count = 0,
	color = 'rgb(255, 255, 255)',
	category_id,
	participants = [],
	listeners = [],
}: IMapEventValues): IModalValues => {
	return {
		title,
		description,
		start: startDate instanceof Date ? startDate.getTime() : startDate,
		end: endDate instanceof Date ? endDate.getTime() : endDate,
		type,
		priority,
		is_private,
		is_finished,
		repeat_step,
		repeat_type,
		repeat_until,
		max_repeats_count,
		color,
		category_id,
		participants,
		listeners,
	};
};
