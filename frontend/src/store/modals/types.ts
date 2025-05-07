import { TPartialEvent } from "types/event";
import { ICalendar } from "types/calendar";

export interface IModalsState {
  isOpenModalEditEvent: boolean;
  isOpenModalCreateEvent: boolean;
  isOpenModalDayInfoEvents: boolean;
  isOpenModalEditCalendar: boolean;
  isOpenModalViewEvent: boolean;
  modalCreateEventOptions: IModalCreateEventOptions | null;
  modalEditEventOptions: IModalEditEventOptions | null;
  modalEditCalendarOptions: IModalEditCalendarOptions | null;
  modalViewEventOptions: IModalViewEventOptions | null;
  selectedDate: Date | null;
}

export interface IModalCreateEventOptions {
  selectedDate: Date;
}

export interface IModalEditEventOptions {
  eventData: TPartialEvent;
  eventId: string;
}

export interface IModalViewEventOptions {
  eventId: string;
}

export interface IModalEditCalendarOptions {
  calendarData: ICalendar;
  calendarId: string;
}