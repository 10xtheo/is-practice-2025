import { TPartialEvent } from "types/event";

export interface IModalsState {
  isOpenModalEditEvent: boolean;
  isOpenModalCreateEvent: boolean;
  isOpenModalDayInfoEvents: boolean;
  modalCreateEventOptions: IModalCreateEventOptions | null;
  modalEditEventOptions: IModalEditEventOptions | null;
  selectedDate: Date | null;
}

export interface IModalCreateEventOptions {
  selectedDate: Date;
}

export interface IModalEditEventOptions {
  eventData: TPartialEvent;
  eventId: string;
}