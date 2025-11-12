import { configureStore } from '@reduxjs/toolkit'
import uploadReducer from './slices/uploadSlice'
import historyReducer from './slices/historySlice'
import deviceReducer from './slices/deviceSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      upload: uploadReducer,
      history: historyReducer,
      device: deviceReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
