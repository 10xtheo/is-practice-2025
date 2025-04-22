export interface ICalendar {
  id: string;
  title: string;
  owner_id: string;
  color: string;
} 

export type TPartialCalendar = Partial<ICalendar>