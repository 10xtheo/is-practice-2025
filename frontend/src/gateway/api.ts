import { METHODS, RequestsOptionsEvents, RequestsOptionsCalendars, RequestsOptionsUsers } from "./types";
import { EventPermission, EventPriority, EventType, IEvent, IEventCreate } from "../types/event";
import { ICalendar, ICalendarCreate } from "../types/calendar";
import { IUser, IUserCreate } from "../types/user";
import { backendUrl } from "../App";

// Stub data for users
let initialUsers: IUser[] = [
  {
    id: '1',
    full_name: 'John Doe',
    position: 'Developer',
    department: 'IT',
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    position: 'Designer',
    department: 'Design',
  },
  {
    id: '3',
    full_name: 'Bob Johnson',
    position: 'Manager',
    department: 'HR',
  },
  {
    id: '4',
    full_name: 'Alice Brown',
    position: 'QA',
    department: 'QA',
  },
  {
    id: '5',
    full_name: 'Charlie Wilson',
    position: 'Manager',
    department: 'HR',
  }
];


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
      is_creator: true,
      is_listener: false,
      permissions: EventPermission.ORGANIZE
    }))
  } });
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
  post = async <IDto>(url: string, body: ICalendarCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body: { category_in: { title: body.title }, event_ids: [] } });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
  patch = async <IDto>(url: string, body: Partial<ICalendar>) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
  put = async <IDto>(url: string, body: Partial<ICalendar>) => this.makeRequest<IDto>({ url, method: METHODS.PUT, body });
}


class HttpUsers {
  private users: IUser[];

  constructor() {
    this.users = [...initialUsers];
  }

  private makeRequest = async <IDtoRequest>(options: RequestsOptionsUsers): Promise<IDtoRequest> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (options.method) {
        case METHODS.GET:          
          return this.users as IDtoRequest;
        
        default:
          throw new Error('Method not supported');
      }
    } catch (err) {
      alert(err.message);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
}

export const requestEvents = new HttpEvents();
export const requestCalendars = new HttpCalendars();
export const requestUsers = new HttpUsers();