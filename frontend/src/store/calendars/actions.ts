import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { ICalendar, ICalendarCreate } from 'types/calendar';
import apiCalendars from 'gateway/calendars';

export const setSelectedCalendars = createAction<string[]>('calendars/setSelectedCalendars');

export const getCalendars = createAsyncThunk<ICalendar[], void, { rejectValue: string }>(
  'calendars/getCalendars',
  async (_, { rejectWithValue }) => {
    try {
      const calendars = await apiCalendars.getCalendars();
      return calendars;
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
      return rejectWithValue('Failed to delete calendar');
    }
  }
); 