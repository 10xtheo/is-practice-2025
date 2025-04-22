import { createAction } from '@reduxjs/toolkit';
import { IModalCreateEventOptions, IModalEditEventOptions, IModalEditCalendarOptions } from './types';

export const openModalCreate = createAction<IModalCreateEventOptions>('modals/openModalCreate');
export const openModalEdit = createAction<IModalEditEventOptions>('modals/openModalEdit');
export const openModalEditCalendar = createAction<IModalEditCalendarOptions>('modals/openModalEditCalendar');
export const openModalDayInfo = createAction<Date>('modals/openModalDayInfo');
export const closeModalCreate = createAction('modals/closeModalCreate');
export const closeModalEdit = createAction('modals/closeModalEdit');
export const closeModalEditCalendar = createAction('modals/closeModalEditCalendar');
export const closeModalDayInfo = createAction('modals/closeModalDayInfo');
