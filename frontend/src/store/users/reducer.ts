import { createSlice } from '@reduxjs/toolkit'
import { IUsersState } from './types'
import { getMe, patchUser } from './actions'

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
      .addCase(patchUser.fulfilled, (state, { payload }) => {
        if (state.user && state.user.id === payload.updatedUser.id) {
          state.user = payload.updatedUser;
        }
      })
  },
  reducers: {}
}) 

export const { reducer } = usersSlice