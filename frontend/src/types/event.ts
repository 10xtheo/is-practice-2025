export interface IEvent {
  id: string; // UUID
  title: string;
  description: string;
  start: number; // timestamp
  end: number; // timestamp
  repeat_step: number;
  is_private: boolean;
  creator_id: string; // UUID
  is_finished: boolean;
  max_repeats_count: number;
  color: string;
  type: EEventTypes;
  priority: EEventPriority;
  category_id: string; // Календарь @TODO фильтрация по календарю
}

export type TPartialEvent = Partial<IEvent>;

export interface IEventCreate {
  title: string;
  description: string;
  start: number;
  end: number;
  repeat_step: number; // @TODO мб указать единицы измерения
  is_private: boolean;
  creator_id: string;
  max_repeats_count: number; // @TODO ивент может повторяться до даты!
  color: string;
  type: EEventTypes;
  priority: EEventPriority;
  category_id: string; // Календарь @TODO фильтрация по календарю
}

export enum EEventTypes {
  TASK = 'Задача',
  EVENT = 'Событие',
  MEETING = 'Встреча',
  NOTE = 'Заметка',
  REMINDER = 'Напоминание',
  OTHER = 'Другое'
}

export enum EEventPriority {
  LOW = 'Низкий',
  MEDIUM = 'Средний',
  HIGH = 'Высокий'
}
