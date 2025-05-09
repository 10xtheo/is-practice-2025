import { createAsyncThunk } from '@reduxjs/toolkit'
import apiEvents from 'gateway/events';
import { IEvent, IEventCreate, TPartialEvent } from 'types/event';
import { IServerUserParticipant } from 'types/user';
import { pickRandomColor } from 'utils/helpers/pickRandomColor';
import { IChatMessage } from '../../components/common/EventChat'
import axios from 'axios';

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
          repeat_type: event.repeat_type,
          repeat_until: new Date(event.repeat_until).getTime(),
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
            department: participant.user.department,
            is_creator: participant.is_creator,
            is_listener: participant.is_listener,
            permissions: participant.permissions
          })),
          category_id: event.eventcategories.length > 0 ? event.eventcategories[0].category_id : '0',
          start: new Date(event.start).getTime(),
          end: new Date(event.end).getTime(),
        }
        
        return frontendEvent
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

export const getEventMessages = createAsyncThunk<
  { data: IChatMessage[], count: number },
  string
>(
  'events/get-event-messages',
  async (eventId, thunkAPI) => {
    try {
      return await apiEvents.getEventMessages(eventId);
    } catch (error) {
      console.error('Error fetching event messages:', error);
      return thunkAPI.rejectWithValue(error)
    }
  }
)

export const getEventFiles = createAsyncThunk(
  'events/getEventFiles',
  async (eventId: string) => {
    const response = await axios.get(`http://localhost:8000/api/v1/events/${eventId}/files`);
    return response.data;
  }
);

export const uploadEventFile = createAsyncThunk(
  'events/uploadEventFile',
  async ({ eventId, file, token }: { eventId: string; file: File, token: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`http://localhost:8000/api/v1/uploadfile?event_id=${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  }
);

export const deleteEventFile = createAsyncThunk(
  'events/deleteEventFile',
  async ({ fileId, token }: { fileId: string, token: string }) => {
    await axios.delete(`http://localhost:8000/api/v1/uploadfile/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return fileId;
  }
);