import { createAsyncThunk } from '@reduxjs/toolkit'
import apiUsers from 'gateway/users';
import { IUser } from 'types/user';

export const getUsers = createAsyncThunk<IUser[]>(
  'users/get-users',
  async (_, thunkAPI) => {
    try {
      const users = await apiUsers.getUsers();
      return users;
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  }
) 