import { METHODS, RequestsOptions } from "./types";
import { IEvent, IEventCreate, TEventTypes } from "../types/event";

// Stub data for events
const initialEvents: IEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly sync',
    start: Date.now() - 1000 * 60 * 60 * 2,
    end: Date.now() + 1000 * 60 * 60 * 2,
    type: 'event',
    color: '#2196F3'
  },
  {
    id: '2',
    title: 'Lunch Break',
    description: 'Team lunch',
    start: Date.now() + 1000 * 60 * 60 * 2,
    end: Date.now() + 1000 * 60 * 60 * 3,
    type: 'event',
    color: '#4CAF50'
  },
  {
    id: '3',
    title: 'Project Deadline',
    description: 'Final submission',
    start: Date.now(),
    end: Date.now() + 1000 * 60 * 60 * 5,
    type: 'event',
    color: '#F44336'
  },
  {
    id: '4',
    title: 'Project Deadline',
    description: 'Final submission',
    start: Date.now() + 1000 * 60 * 60 * 24,
    end: Date.now() + 1000 * 60 * 60 * 25,
    type: 'event',
    color: '#FFC107'
  }
];

class Http {
  private events: IEvent[];

  constructor() {
    this.events = [...initialEvents];
  }

  private makeRequest = async <IDtoRequest>(options: RequestsOptions): Promise<IDtoRequest> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (options.method) {
        case METHODS.GET:
          return this.events as IDtoRequest;
        
        case METHODS.POST:
          if (!options.body) throw new Error('Event data is required');
          const newEvent: IEvent = { 
            id: Date.now().toString(), 
            ...options.body 
          };
          this.events.push(newEvent);
          return newEvent as IDtoRequest;
        
        case METHODS.PUT:
          if (!options.body) throw new Error('Event data is required');
          const eventId = options.url.split('/')[1];
          const eventIndex = this.events.findIndex(e => e.id === eventId);
          if (eventIndex !== -1) {
            this.events[eventIndex] = { 
              ...this.events[eventIndex], 
              ...options.body 
            };
            return this.events[eventIndex] as IDtoRequest;
          }
          throw new Error('Event not found');
        
        case METHODS.DELETE:
          const deleteId = options.url.split('/')[1];
          const deleteIndex = this.events.findIndex(e => e.id === deleteId);
          if (deleteIndex !== -1) {
            this.events.splice(deleteIndex, 1);
            return {} as IDtoRequest;
          }
          throw new Error('Event not found');
        
        default:
          throw new Error('Method not supported');
      }
    } catch (err) {
      alert(err.message);
      throw err;
    }
  }

  get = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.GET });
  post = async <IDto>(url: string, body: IEventCreate) => this.makeRequest<IDto>({ url, method: METHODS.POST, body });
  delete = async <IDto>(url: string) => this.makeRequest<IDto>({ url, method: METHODS.DELETE });
  patch = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PATCH, body });
  put = async <IDto>(url: string, body: Partial<IEvent>) => this.makeRequest<IDto>({ url, method: METHODS.PUT, body });
}

export const request = new Http();