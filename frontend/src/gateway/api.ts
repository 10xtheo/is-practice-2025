import { METHODS, RequestsOptionsEvents, RequestsOptionsCalendars, RequestsOptionsUsers, RequestsOptionsEventParticipants, RequestsOptionsCalendarParticipants } from "./types";
import { EventPermission, IEvent, IEventCreate, IEventTimeManagement} from "../types/event";
import { CategoryPermission, ICalendar, ICalendarCreate } from "../types/calendar";
import { IServerUserParticipant, IServerUserCategoryParticipant, IUserUpdate } from "../types/user";
import { backendUrl } from "../App";

class HttpEventParticipants {
  private makeRequest = async <IDtoRequest>(options: RequestsOptionsEventParticipants): Promise<IDtoRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${backendUrl}/events${options.url}`, {
        method: options.method,
        headers,
        // @ts-ignore
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch event participants');
      }

      if (options.method === METHODS.DELETE) {
        return {} as IDtoRequest;
      }

      return await response.json();
    } catch (err) {
      console.error('Event participants API error:', err);
      throw err;
    }
  }

  post = async <IDto>(url: string, body: IServerUserParticipant) => this.makeRequest<IDto>({ url, method: METHODS.POST, body });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
}

class HttpCalendarParticipants {
  private makeRequest = async <IDtoRequest>(options: RequestsOptionsCalendarParticipants): Promise<IDtoRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${backendUrl}/categories${options.url}`, {
        method: options.method,
        headers,
        // @ts-ignore
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch calendar participants');
      }

      if (options.method === METHODS.DELETE) {
        return {} as IDtoRequest;
      }

      return await response.json();
    } catch (err) {
      console.error('Calendar participants API error:', err);
      throw err;
    }
  }

  post = async <IDto>(url: string, body: IServerUserCategoryParticipant) => this.makeRequest<IDto>({ url, method: METHODS.POST, body });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
}


class HttpEvents {
  private makeRequest = async <IDtoRequest>(options: RequestsOptionsEvents): Promise<IDtoRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${backendUrl}/events${options.url}`, {
        method: options.method,
        headers,
        // @ts-ignore
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch events');
      }

      if (options.method === METHODS.DELETE) {
        return {} as IDtoRequest;
      }

      return await response.json();
    } catch (err) {
      console.error('Events API error:', err);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
  post = async <IDto>(url: string, body: IEventCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body: {
    title: body.title,
    description: body.description,
    start: new Date(body.start),
    end: new Date(body.end),
    repeat_step: body.repeat_step,
    is_private: body.is_private,
    max_repeats_count: body.max_repeats_count,
    type: body.type,
    priority: body.priority,
    category_id: body.category_id,
    participants: body.participants.map(participant => ({
      user_id: participant.id,
      is_creator: false,
      is_listener: false,
      permissions: EventPermission.ORGANIZE
    }))
  } });
  postTimeManagement = async <IDto>(url: string, body: IEventTimeManagement) => this.makeRequest<IDto>({ url, method: METHODS.POST, body: body });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
  patch = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
  put = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PUT, body });
}


class HttpCalendars {
  private makeRequest = async <IDtoRequest>(options: RequestsOptionsCalendars): Promise<IDtoRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${backendUrl}/categories${options.url}`, {
        method: options.method,
        headers,
        // @ts-ignore
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch calendars');
      }

      if (options.method === METHODS.DELETE) {
        return {} as IDtoRequest;
      }

      return await response.json();
    } catch (err) {
      console.error('Calendars API error:', err);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
  post = async <IDto>(url: string, body: ICalendarCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body: 
    { category_in: 
      { title: body.title, participants: 
        body.participants.map(p => ({user_id: p, is_creator: false, permissions: CategoryPermission.VIEW})) 
      }, event_ids: [] 
    } 
  });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
  patch = async <IDto>(url: string, body: Partial<ICalendar>) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
  put = async <IDto>(url: string, body: Partial<ICalendar>) => this.makeRequest<IDto>({ url, method: METHODS.PUT, body: 
    { category_in: 
      { title: body.title }
    }
   });
}


class HttpUsers {

  private makeRequest = async <IDtoRequest>(options: RequestsOptionsUsers): Promise<IDtoRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${backendUrl}/users${options.url}`, {
        method: options.method,
        headers,
        // @ts-ignore
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
      }

      // @ts-ignore
      if (options.method === METHODS.DELETE) {
        return {} as IDtoRequest;
      }

      return await response.json();
    } catch (err) {
      console.error('Users API error:', err);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
  patch = async <IDto>(url: string, body: IUserUpdate) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
}

export const requestEvents = new HttpEvents();
export const requestEventParticipants = new HttpEventParticipants();
export const requestCalendarParticipants = new HttpCalendarParticipants();
export const requestCalendars = new HttpCalendars();
export const requestUsers = new HttpUsers();