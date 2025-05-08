import { createAsyncThunk } from '@reduxjs/toolkit'
import apiEvents from 'gateway/events';
import { IEvent, IEventCreate, TPartialEvent } from 'types/event';
import { IServerUserParticipant } from 'types/user';
import { pickRandomColor } from 'utils/helpers/pickRandomColor';
import { createAction } from '@reduxjs/toolkit';

const createRepeatedEvents = (event: IEvent): IEvent[] => {
  if (event.repeat_step === 0 || !event.max_repeats_count) {
    return [event];
  }

  const repeatedEvents: IEvent[] = [event];
  const duration = event.end - event.start;

  for (let i = 1; i < event.max_repeats_count; i++) {
    const repeatOffset = event.repeat_step * 60 * 60 * 1000; // convert hours to milliseconds
    const newStart = event.start + (repeatOffset * i);
    const newEnd = newStart + duration;

    repeatedEvents.push({
      ...event,
      // id: `${event.id}_repeat_${i}`,
      start: newStart,
      end: newEnd,
    });
  }

  return repeatedEvents;
};

export const getEvents = createAsyncThunk<IEvent[]>(
  'events/get-events',
  async (_, thunkAPI) => {
    try {
      const events = await apiEvents.getEvents();      
      return events?.flatMap((event) => {
        const frontendEvent: IEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          repeat_step: event.repeat_step,
          is_private: event.is_private,
          creator_id: event.creator_id,
          is_finished: event.is_finished,
          max_repeats_count: event.max_repeats_count,
          color: pickRandomColor(),
          type: event.type,
          priority: event.priority,
          participants: event.eventparticipants.map((participant) => ({
            id: participant.user.id,
            email: participant.user.email,
            full_name: participant.user.full_name,
            position: participant.user.position,
            department: participant.user.department
          })),
          category_id: event.eventcategories.length > 0 ? event.eventcategories[0].category_id : '0',
          start: new Date(event.start).getTime(),
          end: new Date(event.end).getTime(),
        }
        
        return createRepeatedEvents(frontendEvent);
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const createEvent = createAsyncThunk<IEvent, IEventCreate>(
  'events/create-event',
  async (newEvent, thunkAPI) => {
    try {      
      return await apiEvents.createEvent(newEvent);
    } catch (error) {  
      alert(error)    
      return thunkAPI.rejectWithValue(error);
    }
  }
)

export const updateEvent = createAsyncThunk<
  { eventId: string, updatedEvent: IEvent },
  { eventId: string, event: TPartialEvent }
>(
  'events/update-event',
  async ({ eventId, event }, thunkAPI) => {
    try {      
      const updatedEvent = await apiEvents.updateEvent(eventId, event);
      return { eventId, updatedEvent }
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const deleteEvent = createAsyncThunk<
  { eventId: string },
  string
>(
  'events/delete-event',
  async (eventId, thunkAPI) => {
    try {
      await apiEvents.deleteEvent(eventId);
      return { eventId };
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const addEventParticipant = createAsyncThunk<
  string,
  { eventId: string; participant: IServerUserParticipant }
>(
  'events/event-add-participant',
  async ({ eventId, participant }, thunkAPI) => {
    try {
      await apiEvents.addParticipant(eventId, participant);
      return eventId;
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const deleteEventParticipant = createAsyncThunk<
  string,
  { eventId: string; userId: string }
>(
  'events/event-del-participant',
  async ({ eventId, userId }, thunkAPI) => {
    try {
      await apiEvents.deleteParticipant(eventId, userId);
      return eventId;
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const findAvailableTimeSlots = createAsyncThunk<
  string[],
  {
    duration_minutes: number;
    participant_ids: string[];
    start_date: string;
    end_date: string;
  }
>(
  'events/find-available-time-slots',
  async (params, thunkAPI) => {
    try {
      return await apiEvents.findAvailableTimeSlots(params);
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
)