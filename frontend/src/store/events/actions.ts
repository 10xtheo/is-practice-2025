import { createAsyncThunk } from '@reduxjs/toolkit'
import apiEvents from 'gateway/events';
import { IEvent, IEventCreate, TPartialEvent } from 'types/event';
import { pickRandomColor } from 'utils/helpers/pickRandomColor';
export const getEvents = createAsyncThunk<IEvent[]>(
  'events/get-events',
  async (_, thunkAPI) => {
    try {
      const events = await apiEvents.getEvents();
      return events?.map((event) => {
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
            full_name: participant.user.full_name,
            position: participant.user.position,
            department: participant.user.department
          })),
          category_id: event.eventcategories[0].category_id,
          start: new Date(event.start).getTime(),
          end: new Date(event.end).getTime(),
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