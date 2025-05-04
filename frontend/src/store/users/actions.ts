import { createAsyncThunk } from '@reduxjs/toolkit'
import apiUsers from 'gateway/users';
import { IUser } from 'types/user';

export const getMe = createAsyncThunk<IUser>(
  'users/get-me',
  async (_, thunkAPI) => {
    try {
      const user = await apiUsers.getMe();      
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  }
) 