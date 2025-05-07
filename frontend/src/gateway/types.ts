import { ICalendar } from "types/calendar";
import { IEvent, IServerEventCreate } from "types/event";
import { IServerUserParticipant, IUserUpdate } from "types/user";

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
  body?: IServerEventCreate;
}

interface PutRequestOptionsEvents extends BaseRequestOptions<METHODS.PUT> {
  body?: Partial<IEvent>;
}

interface PatchRequestOptionsEvents extends BaseRequestOptions<METHODS.PATCH> {
  body?: Partial<IEvent>;
}

export type RequestsOptionsEvents = GetRequestOptions | PostRequestOptionsEvents | DeleteRequestOptions | PutRequestOptionsEvents | PatchRequestOptionsEvents;


interface PostRequestOptionsEventParticipants extends BaseRequestOptions<METHODS.POST> {
  body?: IServerUserParticipant;
}

export type RequestsOptionsEventParticipants = PostRequestOptionsEventParticipants | DeleteRequestOptions;

interface PostRequestOptionsCalendars extends BaseRequestOptions<METHODS.POST> {
  body: {
    category_in: {
      title: string,
      participants: {
        user_id: string,
        is_creator: boolean,
        permissions: string
      }[]
    }
    event_ids: string[];
  }
}

interface PutRequestOptionsCalendars extends BaseRequestOptions<METHODS.PUT> {
  body?: Partial<ICalendar>;
}

interface PatchRequestOptionsCalendars extends BaseRequestOptions<METHODS.PATCH> {
  body?: Partial<ICalendar>;
}

export type RequestsOptionsCalendars = GetRequestOptions | PostRequestOptionsCalendars | DeleteRequestOptions | PutRequestOptionsCalendars | PatchRequestOptionsCalendars;

interface PatchRequestOptionsUsers extends BaseRequestOptions<METHODS.PATCH> {
  body?: IUserUpdate;
}


export type RequestsOptionsUsers = GetRequestOptions | PatchRequestOptionsUsers;



export interface RequestArgs {
  method: METHODS;
  options: RequestsOptionsEvents | RequestsOptionsCalendars;
}