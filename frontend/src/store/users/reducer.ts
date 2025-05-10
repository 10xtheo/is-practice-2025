import { createSlice } from '@reduxjs/toolkit';
import { IUsersState } from './types';
import { getMe, patchUser, getUsers } from './actions';

const initialState: IUsersState = {
	user: undefined,
	users: [],
};

export const usersSlice = createSlice({
	name: 'users',
	initialState,
	extraReducers: (builder) => {
		builder
			.addCase(getUsers.fulfilled, (state, { payload }) => {
				state.users = payload;
			})
			.addCase(getMe.fulfilled, (state, { payload }) => {
				state.user = payload;
			})
			.addCase(patchUser.fulfilled, (state, { payload }) => {
				if (state.user && state.user.id === payload.updatedUser.id) {
					state.user = payload.updatedUser;
				}
			});
	},
	reducers: {},
});

export const { reducer } = usersSlice;
