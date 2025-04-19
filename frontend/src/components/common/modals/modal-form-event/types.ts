import { IValidatorData } from "hooks/useValidator/types";
import { TEventTypes } from "types/event";

export interface IModalValues extends IValidatorData {
  title: string;
  start: number; // timestamp
  end: number; // timestamp
  description: string;
  isLongEvent: boolean;
  repeat_step: number;
  is_private: boolean;
  creator_id: string;
  max_repeats_count: number;
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
}