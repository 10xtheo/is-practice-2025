export interface ICalendar {
  id: string;
  title: string;
  owner_id: string;
  color: string;
} 

export interface ICalendarCreate extends Omit<ICalendar, 'id'> {} 