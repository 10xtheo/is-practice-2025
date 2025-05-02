import { METHODS, RequestsOptionsEvents, RequestsOptionsCalendars, RequestsOptionsUsers } from "./types";
import { EventPriority, EventType, IEvent, IEventCreate } from "../types/event";
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

// Stub data for events
let initialEvents: IEvent[] = [
  {
    id: '96c2a1a3-41d4-494c-a0a4-4480d10ec204',
    title: 'Team Meeting',
    description: 'Weekly sync',
    start: Date.now() - 1000 * 60 * 60 * 2,
    end: Date.now() + 1000 * 60 * 60 * 2,
    repeat_step: 23,
    is_private: true,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#2196F3',
    type: EventType.MEETING,
    priority: EventPriority.LOW,
    category_id: '1',
    participants: [
      initialUsers[0],
      initialUsers[1],
      initialUsers[2]
    ]
  },
  {
    id: '8b6f0168-08c3-41c5-a59d-b58c4ea33ab6',
    title: 'Lunch Break',
    description: 'Team lunch',
    start: Date.now() + 1000 * 60 * 60 * 2,
    end: Date.now() + 1000 * 60 * 60 * 3,
    repeat_step: 1,
    is_private: false,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#4CAF50',
    type: EventType.HOLIDAY,
    priority: EventPriority.MEDIUM,
    category_id: '3',
    participants: [
      initialUsers[0],
    ]
  },
  {
    id: '3',
    title: 'Project Deadline',
    description: 'Final submission',
    start: Date.now(),
    end: Date.now() + 1000 * 60 * 60 * 5,
    repeat_step: 1,
    is_private: false,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#F44336',
    type: EventType.TASK,
    priority: EventPriority.HIGH,
    category_id: '2',
    participants: [
      initialUsers[0],
      initialUsers[4],
    ]
  },
  {
    id: '4',
    title: 'Project Deadline',
    description: 'Final submission',
    start: Date.now() + 1000 * 60 * 60 * 24,
    end: Date.now() + 1000 * 60 * 60 * 25,
    repeat_step: 1,
    is_private: false,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#FFC107',
    type: EventType.TASK,
    priority: EventPriority.LOW,
    category_id: '2',
    participants: [
      initialUsers[3],
    ]
  },
  {
    id: '5',
    title: 'date with Sizova',
    description: 'descr',
    start: Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3,
    end: Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 5,
    repeat_step: 1,
    is_private: false,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#FFC0CB',
    type: EventType.MEETING,
    priority: EventPriority.HIGH,
    category_id: '1',
    participants: []
  },
  {
    id: "12345",
    title: "tw",
    description: "",
    start: 1745182800000,
    end: 1745186400000,
    repeat_step: 0,
    is_private: false,
    creator_id: "",
    is_finished: false,
    max_repeats_count: 0,
    type: EventType.REMINDER,
    priority: EventPriority.MEDIUM,
    color: "rgb(142, 36, 170)",
    category_id: "2",
    participants: [
      initialUsers[0],
      initialUsers[1],
      initialUsers[2],
      initialUsers[3],
      initialUsers[4],
    ]
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
  post = async <IDto>(url: string, body: IEventCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
  patch = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
  put = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PUT, body });
}


export const initialCalendars: ICalendar[] = [
  {
    id: '1',
    title: 'Work Calendar',
    owner_id: 'user1',
    color: '#FF5733',
    participants: [
      initialUsers[0],
      initialUsers[1],
      initialUsers[2],
      initialUsers[3],
      initialUsers[4],
    ]
  },
  {
    id: '2',
    title: 'Personal Calendar',
    owner_id: 'user1',
    color: '#33FF57',
    participants: [
      initialUsers[0],
      initialUsers[1],
    ]
  },
  {
    id: '3',
    title: 'Family Calendar',
    owner_id: 'user1',
    color: '#3357FF',
    participants: []
  }
];

class HttpCalendars {
  private calendars: ICalendar[];

  constructor() {
    this.calendars = [...initialCalendars];
  }

  private makeRequest = async <IDtoRequest>(options: RequestsOptionsCalendars): Promise<IDtoRequest> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (options.method) {
        case METHODS.GET:              
          return this.calendars as IDtoRequest;
        
        case METHODS.POST:
          if (!options.body) throw new Error('Calendar data is required');

          const newCalendar: ICalendar = { 
            id: Date.now().toString(), 
            ...options.body,
            owner_id: 'user1',
            participants: options.body.participants.map(participant_id => {
              return {id: participant_id, full_name: '', position: '', department: ''}
            })
          };
          this.calendars = [...this.calendars, newCalendar];
          
          return newCalendar as IDtoRequest;
        
        case METHODS.PUT:
          if (!options.body) throw new Error('Calendar data is required');
          
          const calendarId = options.url.split('/')[1];
          const calendarIndex = this.calendars.findIndex(c => c.id === calendarId);
          if (calendarIndex !== -1) {
            this.calendars = [...this.calendars.slice(0, calendarIndex), 
              {...options.body, id: this.calendars[calendarIndex].id} as ICalendar,
              ...this.calendars.slice(calendarIndex + 1)];
            return this.calendars[calendarIndex] as IDtoRequest;
          }
          throw new Error('Calendar not found');
        
        case METHODS.DELETE:
          const deleteId = options.url.split('/')[1];
          const deleteIndex = this.calendars.findIndex(c => c.id === deleteId);
          if (deleteIndex !== -1) {
            this.calendars = [...this.calendars.slice(0, deleteIndex), ...this.calendars.slice(deleteIndex + 1)];
            return {} as IDtoRequest;
          }
          throw new Error('Calendar not found');
        
        default:
          throw new Error('Method not supported');
      }
    } catch (err) {
      alert(err.message);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
  post = async <IDto>(url: string, body: ICalendarCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body });
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