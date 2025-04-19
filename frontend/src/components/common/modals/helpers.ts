import { IMapEventValues, IModalValues } from "./types";
import { EEventTypes, EEventPriority } from "types/event";
import { colors } from "../form-elements/color-picker/colors";

export const getMapEventValues = ({
  title,
  description,
  startDate,
  endDate,
  type = EEventTypes.EVENT,
  priority = EEventPriority.MEDIUM,
  is_private = false,
  repeat_step = 0,
  max_repeats_count = 0,
  creator_id = '',
  color = colors[0]
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
    repeat_step,
    max_repeats_count,
    creator_id,
    color
  }
}