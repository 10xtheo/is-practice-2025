import { configureStore } from '@reduxjs/toolkit';

import { reducers } from './rootReducer';

export const store = configureStore({
  reducer: reducers,
  devTools: true,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
})

// Для отладки
if (typeof window !== 'undefined') {
  window['store'] = store
}

export type TypeRootState = ReturnType<typeof store.getState>