import { createSlice } from '@reduxjs/toolkit';
import { IEvent } from 'types/event';
import {
	getEvents,
	createEvent,
	updateEvent,
	deleteEvent,
	addEventParticipant,
	deleteEventParticipant,
} from './actions';

interface IEventsState {
	events: IEvent[];
}

const initialState: IEventsState = {
	events: [],
};

export const eventsSlice = createSlice({
	name: 'events',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getEvents.fulfilled, (state, { payload }) => {
				state.events = payload;
			})
			.addCase(createEvent.fulfilled, (state, { payload }) => {
				state.events.push(payload);
			})
			.addCase(updateEvent.fulfilled, (state, { payload }) => {
				const { eventId, updatedEvent } = payload;
				const index = state.events.findIndex((event) => event.id === eventId);
				if (index !== -1) {
					state.events[index] = updatedEvent;
				}
			})
			.addCase(deleteEvent.fulfilled, (state, { payload }) => {
				const { eventId } = payload;
				state.events = state.events.filter((event) => event.id !== eventId);
			})
			.addCase(addEventParticipant.fulfilled, (state, { payload }) => {
				state.events.find((event) => event.id === payload);
			})
			.addCase(deleteEventParticipant.fulfilled, (state, { payload }) => {
				state.events.find((event) => event.id === payload);
			});
	},
});

export const { reducer } = eventsSlice;
