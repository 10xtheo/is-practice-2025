import { IMapEventValues, IModalValues } from './types';
import { EventType, EventPriority } from 'types/event';
import { RepeatType } from 'types/event';

const formatEnumValue = (value: string): string => {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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
			label: formatEnumValue(value),
		}))
		.filter((el) => el.value !== RepeatType.RECURRING_DUPLICATE && el.value !== RepeatType.RECURRING_PARENT);
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
	repeat_until = Date.now(),
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
