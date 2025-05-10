import { createAsyncThunk } from '@reduxjs/toolkit';
import apiUsers from 'gateway/users';
import { IUser, IUserUpdate } from 'types/user';

export const getUsers = createAsyncThunk<IUser[]>('users/get-users', async (_, thunkAPI) => {
	try {
		const users = await apiUsers.getUsers();
		return users.data.map((user) => user);
	} catch (error) {
		return thunkAPI.rejectWithValue(error);
	}
});

export const getMe = createAsyncThunk<IUser>('users/get-me', async (_, thunkAPI) => {
	try {
		const user = await apiUsers.getMe();
		return user;
	} catch (error) {
		return thunkAPI.rejectWithValue(error);
	}
});

export const patchUser = createAsyncThunk<{ updatedUser: IUser }, { userData: IUserUpdate }, { rejectValue: string }>(
	'users/patchUser',
	async ({ userData }, { rejectWithValue }) => {
		try {
			const updatedUser = await apiUsers.patchUser(userData);
			return { updatedUser };
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to update user');
		}
	},
);
