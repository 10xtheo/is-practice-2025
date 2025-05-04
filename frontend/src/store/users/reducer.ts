import { createSlice } from '@reduxjs/toolkit'
import { IUsersState } from './types'
import { getMe } from './actions'
import { IUser } from "types/user";

const initialState: IUsersState = {
  user: undefined
}

export const usersSlice = createSlice({
  name: 'user',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.user = payload
      })
  },
  reducers: {}
}) 

export const { reducer } = usersSlice