import { IValidatorData } from "hooks/useValidator/types";
import { EEventTypes, EEventPriority } from "types/event";

export interface IModalValues extends IValidatorData {
  title: string;
  start: number; // timestamp
  end: number; // timestamp
  description: string;
  repeat_step: number;
  is_private: boolean;
  creator_id: string;
  max_repeats_count: number;
  type: EEventTypes;
  priority: EEventPriority;
  color: string;
}

export interface IMapEventValues {
  title: string;
  description: string;
  start: number;
  end: number;
  repeat_step: number;
  is_private: boolean;
  creator_id: string;
  max_repeats_count: number;
  type: EEventTypes;
  priority: EEventPriority;
  color: string;
}