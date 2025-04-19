import { IRules } from "hooks/useValidator/types";

export const createEventSchema: IRules = {
  title: {
    isRequired: true
  },
  start: {
    isRequired: true, 
  },
  end: {
    isRequired: true,
    isDateInFeature: 'start'
  },
  repeat_step: {
    isRequired: true,
    isNumber: true
  },
  is_private: {
    isRequired: true
  },
  creator_id: {
    isRequired: true
  },
  max_repeats_count: {
    isRequired: true,
    isNumber: true,
    min: 0
  }
}