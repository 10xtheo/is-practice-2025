import { IValidatorData } from "hooks/useValidator/types";
import { EventType, EventPriority } from "types/event";

export interface IModalValues extends IValidatorData {
  title: string;
  start: number; // timestamp
  end: number; // timestamp
  description: string;
  type: EventType;
  priority: EventPriority;
  is_private: boolean;
  is_finished: boolean;
  repeat_step: number;
  max_repeats_count: number;
  color: string;
  category_id: string;
  participants: string[];
}

export interface IMapEventValues {
  title: string;
  description: string;
  startDate: Date | number;
  endDate: Date | number;
  type?: EventType;
  priority?: EventPriority;
  is_private?: boolean;
  is_finished?: boolean;
  repeat_step?: number;
  max_repeats_count?: number;
  color?: string;
  category_id: string;
  participants: string[];
}

export interface IModalValuesCalendar extends IValidatorData {
  title: string;
  // color: string;
}