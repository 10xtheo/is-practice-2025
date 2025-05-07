import { IMapEventValues, IModalValues } from "./types";
import { EventType, EventPriority } from "types/event";
import { colors } from "../form-elements/color-picker/colors";

const formatEnumValue = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const getEventTypeOptions = () => {
  return Object.entries(EventType).map(([key, value]) => ({
    value: value,
    label: formatEnumValue(value)
  }));
};

export const getEventPriorityOptions = () => {
  return Object.entries(EventPriority).map(([key, value]) => ({
    value: value,
    label: formatEnumValue(value)
  }));
};

export const getMapEventValues = ({
  title,
  description,
  startDate,
  endDate,
  type,
  priority,
  is_finished = false,
  is_private = false,
  repeat_step = 0,
  max_repeats_count = 0,
  color = 'rgb(255, 255, 255)',
  category_id,
  participants = []
}: IMapEventValues): IModalValues => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  return {
    title,
    description,
    start: start.getTime(),
    end: end.getTime(),
    type,
    priority,
    is_private,
    is_finished,
    repeat_step,
    max_repeats_count,
    color,
    category_id,
    participants
  }
}