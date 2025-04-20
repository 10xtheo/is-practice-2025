import { IValidatorData } from "hooks/useValidator/types";
import { EEventTypes, EEventPriority } from "types/event";

export interface IModalValues extends IValidatorData {
  title: string;
  start: number; // timestamp
  end: number; // timestamp
  description: string;
  type: EEventTypes;
  priority: EEventPriority;
  is_private: boolean;
  repeat_step: number;
  max_repeats_count: number;
  creator_id: string;
  color: string;
  category_id: string;
}

export interface IMapEventValues {
  title: string;
  description: string;
  startDate: Date | number;
  endDate: Date | number;
  type?: EEventTypes;
  priority?: EEventPriority;
  is_private?: boolean;
  repeat_step?: number;
  max_repeats_count?: number;
  creator_id?: string;
  color?: string;
  category_id: string;
}