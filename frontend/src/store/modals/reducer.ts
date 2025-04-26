import { createSlice } from '@reduxjs/toolkit';
import { IModalsState } from './types';
import {
  openModalCreate,
  openModalEdit,
  openModalEditCalendar,
  openModalDayInfo,
  closeModalCreate,
  closeModalEdit,
  closeModalEditCalendar,
  closeModalDayInfo
} from './actions';

const initialState: IModalsState = {
  isOpenModalEditEvent: false,
  isOpenModalCreateEvent: false,
  isOpenModalDayInfoEvents: false,
  isOpenModalEditCalendar: false,
  modalCreateEventOptions: null,
  modalEditEventOptions: null,
  modalEditCalendarOptions: null,
  selectedDate: null
};

export const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(openModalCreate, (state, { payload }) => {
        state.isOpenModalCreateEvent = true;
        state.modalCreateEventOptions = payload;
      })
      .addCase(closeModalCreate, (state) => {
        state.isOpenModalCreateEvent = false;
        state.modalCreateEventOptions = null;
      })
      .addCase(openModalEdit, (state, { payload }) => {
        state.isOpenModalEditEvent = true;
        state.modalEditEventOptions = payload;
      })
      .addCase(closeModalEdit, (state) => {
        state.isOpenModalEditEvent = false;
        state.modalEditEventOptions = null;
      })
      .addCase(openModalEditCalendar, (state, { payload }) => {
        state.isOpenModalEditCalendar = true;
        state.modalEditCalendarOptions = payload;
      })
      .addCase(closeModalEditCalendar, (state) => {
        state.isOpenModalEditCalendar = false;
        state.modalEditCalendarOptions = null;
      })
      .addCase(openModalDayInfo, (state, { payload }) => {
        state.isOpenModalDayInfoEvents = true;
        state.selectedDate = payload;
      })
      .addCase(closeModalDayInfo, (state) => {
        state.isOpenModalDayInfoEvents = false;
        state.selectedDate = null;
      });
  }
});

export const { reducer } = modalsSlice