import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface HistoryItem {
  uploadId: string
  deviceId: string
  fileCount: number
  textBoxCount: number
  isPrivate: boolean
  isPaid: boolean
  expiresAt: string
  createdAt: string
  qrCodeUrl: string
}

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  error: string | null
}

const initialState: HistoryState = {
  items: [],
  isLoading: false,
  error: null,
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setHistory: (state, action: PayloadAction<HistoryItem[]>) => {
      state.items = action.payload
      state.isLoading = false
      state.error = null
    },
    addHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      state.items.unshift(action.payload)
    },
    removeHistoryItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.uploadId !== action.payload
      )
    },
    clearHistory: (state) => {
      state.items = []
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

export const {
  setLoading,
  setHistory,
  addHistoryItem,
  removeHistoryItem,
  clearHistory,
  setError,
} = historySlice.actions
export default historySlice.reducer
