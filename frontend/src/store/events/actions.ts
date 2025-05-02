import { createAsyncThunk } from '@reduxjs/toolkit'
import apiEvents from 'gateway/events';
import { IEvent, IEventCreate, TPartialEvent } from 'types/event';

export const getEvents = createAsyncThunk<IEvent[]>(
  'events/get-events',
  async (_, thunkAPI) => {
    try {
      const events = await apiEvents.getEvents();
      return events?.map((event) => {
        const frontendEvent: IEvent = {
          ...event,
          start: new Date(event.start).getTime(),
          end: new Date(event.end).getTime(),
          category_id: '1' // @TODO подождать фикса от пацанов
        }
                
        return frontendEvent;
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
      return thunkAPI.rejectWithValue(error)
    }
  }
)