import { createSlice } from '@reduxjs/toolkit';
import { ICalendar } from 'types/calendar';
import { getCalendars, createCalendar, updateCalendar, deleteCalendar } from './actions';

interface ICalendarsState {
  calendars: ICalendar[];
  selectedCalendarIds: string[];
}

const initialState: ICalendarsState = {
  calendars: [],
  selectedCalendarIds: []
};

export const calendarsSlice = createSlice({
  name: 'calendars',
  initialState,
  reducers: {
    setSelectedCalendars: (state, { payload }: { payload: string[] }) => {
      state.selectedCalendarIds = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCalendars.fulfilled, (state, { payload }) => {
        state.calendars = payload;
        state.selectedCalendarIds = payload.map(calendar => calendar.id);
      })
      .addCase(updateCalendar.fulfilled, (state, { payload }) => {
        const { calendarId, updatedCalendar } = payload;
        state.calendars = state.calendars.map(calendar => 
          calendar.id === calendarId ? updatedCalendar : calendar
        );
      })
      .addCase(deleteCalendar.fulfilled, (state, { payload }) => {
        const { calendarId } = payload;
        state.calendars = state.calendars.filter(calendar => calendar.id !== calendarId);
        state.selectedCalendarIds = state.selectedCalendarIds.filter(id => id !== calendarId);
      })
      .addCase(createCalendar.fulfilled, (state, { payload }) => {
        state.calendars = [...state.calendars, payload];
        state.selectedCalendarIds = [...state.selectedCalendarIds, payload.id];
      });
  }
});

export const { setSelectedCalendars } = calendarsSlice.actions;
export const { reducer } = calendarsSlice; 