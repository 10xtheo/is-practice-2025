import { ICalendar, ICalendarCreate } from "types/calendar";
import { IEvent, IEventCreate } from "../types/event";

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

interface BaseRequestOptions<Met> {
  url: string;
  method: Met;
}

type GetRequestOptions = BaseRequestOptions<METHODS.GET>;

type DeleteRequestOptions = BaseRequestOptions<METHODS.DELETE>;

interface PostRequestOptionsEvents extends BaseRequestOptions<METHODS.POST> {
  body?: IEventCreate;
}

interface PutRequestOptionsEvents extends BaseRequestOptions<METHODS.PUT> {
  body?: Partial<IEvent>;
}

interface PatchRequestOptionsEvents extends BaseRequestOptions<METHODS.PATCH> {
  body?: Partial<IEvent>;
}

export type RequestsOptionsEvents = GetRequestOptions | PostRequestOptionsEvents | DeleteRequestOptions | PutRequestOptionsEvents | PatchRequestOptionsEvents;

interface PostRequestOptionsCalendars extends BaseRequestOptions<METHODS.POST> {
  body?: ICalendarCreate;
}

interface PutRequestOptionsCalendars extends BaseRequestOptions<METHODS.PUT> {
  body?: Partial<ICalendar>;
}

interface PatchRequestOptionsCalendars extends BaseRequestOptions<METHODS.PATCH> {
  body?: Partial<ICalendar>;
}

export type RequestsOptionsCalendars = GetRequestOptions | PostRequestOptionsCalendars | DeleteRequestOptions | PutRequestOptionsCalendars | PatchRequestOptionsCalendars;

export type RequestsOptionsUsers = GetRequestOptions;



export interface RequestArgs {
  method: METHODS;
  options: RequestsOptionsEvents | RequestsOptionsCalendars;
}