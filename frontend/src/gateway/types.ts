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

interface PostRequestOptions extends BaseRequestOptions<METHODS.POST> {
  body?: IEventCreate;
}

interface PutRequestOptions extends BaseRequestOptions<METHODS.PUT> {
  body?: Partial<IEvent>;
}

interface PatchRequestOptions extends BaseRequestOptions<METHODS.PATCH> {
  body?: Partial<IEvent>;
}

export type RequestsOptions = GetRequestOptions | PostRequestOptions | DeleteRequestOptions | PutRequestOptions | PatchRequestOptions;

export interface RequestArgs {
  method: METHODS;
  options: RequestsOptions;
}