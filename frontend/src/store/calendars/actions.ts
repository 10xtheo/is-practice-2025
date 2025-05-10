import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { ICalendar, ICalendarCreate } from 'types/calendar';
import apiUsers from 'gateway/users';
import apiCalendars from 'gateway/calendars';
import { pickRandomColor } from 'utils/helpers/pickRandomColor';
import { IServerUserCategoryParticipant } from 'types/user';

export const setSelectedCalendars = createAction<string[]>('calendars/setSelectedCalendars');

export const getCalendars = createAsyncThunk<ICalendar[], void, { rejectValue: string }>(
  'calendars/getCalendars',
  async (_, { rejectWithValue }) => {
    try {
      const calendars = await apiCalendars.getCalendars();
      return Promise.all(calendars?.data.map(async (calendar) => {
        const participants = await apiCalendars.getParticipants(calendar.id)
        const users = await apiUsers.getUsers()
        
        return {
          ...calendar,
          color: pickRandomColor(),
          participants: participants.data.map((p) => {
            const user = users.data.find(u => u.id === p.user_id)
            if (!user) {
              return;
            }

            return user
          })
        }
      }))
    } catch (error) {
      return rejectWithValue('Failed to fetch calendars');
    }
  }
);

export const createCalendar = createAsyncThunk<ICalendar, ICalendarCreate, { rejectValue: string }>(
  'calendars/createCalendar',
  async (calendarData, { rejectWithValue }) => {
    try {
      return await apiCalendars.createCalendar(calendarData);
    } catch (error) {
      alert(error)
      return rejectWithValue('Failed to create calendar');
    }
  }
);

export const updateCalendar = createAsyncThunk<
  { calendarId: string; updatedCalendar: ICalendar },
  { calendarId: string; calendarData: Partial<ICalendar> },
  { rejectValue: string }
>(
  'calendars/updateCalendar',
  async ({ calendarId, calendarData }, { rejectWithValue }) => {
    try {
      const updatedCalendar = await apiCalendars.updateCalendar(calendarId, calendarData);
      return { calendarId, updatedCalendar }
    } catch (error) {
      alert(error)
      return rejectWithValue('Failed to update calendar');
    }
  }
);

export const deleteCalendar = createAsyncThunk<{ calendarId: string }, string, { rejectValue: string }>(
  'calendars/deleteCalendar',
  async (calendarId, { rejectWithValue }) => {
    try {
      await apiCalendars.deleteCalendar(calendarId);
      return { calendarId };
    } catch (error) {
      alert(error)
      return rejectWithValue('Failed to delete calendar');
    }
  }
);

export const addCalendarParticipant = createAsyncThunk<
  string,
  { calendarId: string; participant: IServerUserCategoryParticipant }
>(
  'calendars/calendar-add-participant',
  async ({ calendarId, participant }, thunkAPI) => {
    try {
      await apiCalendars.addParticipant(calendarId, participant);
      return calendarId;
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
);

export const deleteCalendarParticipant = createAsyncThunk<
  string,
  { calendarId: string; userId: string }
>(
  'calendars/calendar-del-participant',
  async ({ calendarId, userId }, thunkAPI) => {
    try {
      await apiCalendars.deleteParticipant(calendarId, userId);
      return calendarId;
    } catch (error) {
      alert(error)
      return thunkAPI.rejectWithValue(error)
    }
  }
); 