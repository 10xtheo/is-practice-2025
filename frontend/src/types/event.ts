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
  // @TODO мб категорию сюда добавить
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
  // @TODO мб категорию сюда добавить
}

export type TEventTypes = 'event' | 'long-event';