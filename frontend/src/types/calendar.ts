import { IUser } from "./user";

export interface ICalendar {
  id: string;
  title: string;
  owner_id: string;
  color: string;
  participants: IUser[];
} 

export type TPartialCalendar = Partial<ICalendar>

export interface ICalendarCreate {
  title: string;
  // color: string;
  participants: string[];
}

export enum CategoryPermission {
  VIEW = "view",
  EDIT = "edit",
  MANAGE = "manage"
}
