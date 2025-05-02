import { IRules } from "hooks/useValidator/types";

export const createEventSchema: IRules = {
  title: {
    isRequired: true,
    minLength: 1,
    maxLength: 100
  },
  description: {
    isRequired: false,
    maxLength: 1000
  },
  start: {
    isRequired: true
  },
  end: {
    isRequired: true,
    isDateInFuture: 'start' // @TODO нейроистория не работает
  },
  repeat_step: {
    isRequired: false,
    isNumber: true,
    min: 0
  },
  max_repeats_count: {
    isRequired: false,
    isNumber: true,
    min: 0
  },
  is_private: {
    isRequired: false
  },
  type: {
    isRequired: true
  },
  priority: {
    isRequired: true
  },
  color: {
    isRequired: true,
  }
}