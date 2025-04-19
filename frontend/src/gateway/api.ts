import { METHODS, RequestsOptions } from "./types";
import { EEventPriority, EEventTypes, IEvent, IEventCreate } from "../types/event";

// Stub data for events
const initialEvents: IEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly sync',
    start: Date.now() - 1000 * 60 * 60 * 2,
    end: Date.now() + 1000 * 60 * 60 * 2,
    repeat_step: 1,
    is_private: false,
    creator_id: '1',
    is_finished: false,
    max_repeats_count: 1,
    color: '#2196F3',
    type: EEventTypes.MEETING,
    priority: EEventPriority.LOW
  },
  {
    id: '2',
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
    type: EEventTypes.OTHER,
    priority: EEventPriority.MEDIUM
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
    type: EEventTypes.TASK,
    priority: EEventPriority.HIGH
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
    type: EEventTypes.TASK,
    priority: EEventPriority.LOW
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
    type: EEventTypes.MEETING,
    priority: EEventPriority.HIGH
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
            ...options.body,
            is_finished: false
          };
          this.events = [...this.events, newEvent];
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