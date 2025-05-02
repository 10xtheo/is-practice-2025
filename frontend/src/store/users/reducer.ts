import { createSlice } from '@reduxjs/toolkit'
import { IUsersState } from './types'
import { getUsers } from './actions'

const initialState: IUsersState = {
  users: []
}

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        state.users = payload
      })
  },
  reducers: {}
}) 

export const { reducer } = usersSlice