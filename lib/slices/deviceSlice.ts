import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DeviceState {
  deviceId: string | null
  deviceName: string | null
  isInitialized: boolean
}

const initialState: DeviceState = {
  deviceId: null,
  deviceName: null,
  isInitialized: false,
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload
      state.isInitialized = true
    },
    setDeviceName: (state, action: PayloadAction<string>) => {
      state.deviceName = action.payload
    },
    initializeDevice: (state) => {
      state.isInitialized = true
    },
  },
})

export const { setDeviceId, setDeviceName, initializeDevice } =
  deviceSlice.actions
export default deviceSlice.reducer
