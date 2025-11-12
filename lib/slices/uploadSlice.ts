import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  preview?: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error'
}

export interface TextBox {
  id: string
  title: string
  content: string
}

interface UploadState {
  files: FileItem[]
  textBoxes: TextBox[]
  isPrivate: boolean
  password: string
  wantsLifetimeAccess: boolean
  captchaVerified: boolean
  captchaToken: string | null
  isUploading: boolean
  uploadError: string | null
  currentUploadId: string | null
}

const initialState: UploadState = {
  files: [],
  textBoxes: [],
  isPrivate: false,
  password: '',
  wantsLifetimeAccess: false,
  captchaVerified: false,
  captchaToken: null,
  isUploading: false,
  uploadError: null,
  currentUploadId: null,
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<File[]>) => {
      const newFiles: FileItem[] = action.payload.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadStatus: 'pending',
      }))
      state.files = [...state.files, ...newFiles]
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f.id !== action.payload)
    },
    updateFileProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const file = state.files.find((f) => f.id === action.payload.id)
      if (file) {
        file.uploadProgress = action.payload.progress
        file.uploadStatus = 'uploading'
      }
    },
    updateFileStatus: (
      state,
      action: PayloadAction<{ id: string; status: FileItem['uploadStatus'] }>
    ) => {
      const file = state.files.find((f) => f.id === action.payload.id)
      if (file) {
        file.uploadStatus = action.payload.status
      }
    },
    addTextBox: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      state.textBoxes.push({
        id: action.payload.id,
        title: action.payload.title,
        content: '',
      })
    },
    removeTextBox: (state, action: PayloadAction<string>) => {
      state.textBoxes = state.textBoxes.filter((tb) => tb.id !== action.payload)
    },
    updateTextBox: (
      state,
      action: PayloadAction<{ id: string; title?: string; content?: string }>
    ) => {
      const textBox = state.textBoxes.find((tb) => tb.id === action.payload.id)
      if (textBox) {
        if (action.payload.title !== undefined)
          textBox.title = action.payload.title
        if (action.payload.content !== undefined)
          textBox.content = action.payload.content
      }
    },
    setPrivacy: (
      state,
      action: PayloadAction<{ isPrivate: boolean; password?: string }>
    ) => {
      state.isPrivate = action.payload.isPrivate
      if (action.payload.password !== undefined) {
        state.password = action.payload.password
      }
    },
    setWantsLifetimeAccess: (state, action: PayloadAction<boolean>) => {
      state.wantsLifetimeAccess = action.payload
    },
    setCaptchaVerified: (
      state,
      action: PayloadAction<{ verified: boolean; token: string | null }>
    ) => {
      state.captchaVerified = action.payload.verified
      state.captchaToken = action.payload.token
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.uploadError = action.payload
    },
    setCurrentUploadId: (state, action: PayloadAction<string | null>) => {
      state.currentUploadId = action.payload
    },
    resetUpload: (state) => {
      state.files = []
      state.textBoxes = []
      state.isPrivate = false
      state.password = ''
      state.wantsLifetimeAccess = false
      state.captchaVerified = false
      state.captchaToken = null
      state.isUploading = false
      state.uploadError = null
      state.currentUploadId = null
    },
  },
})

export const {
  addFiles,
  removeFile,
  updateFileProgress,
  updateFileStatus,
  addTextBox,
  removeTextBox,
  updateTextBox,
  setPrivacy,
  setWantsLifetimeAccess,
  setCaptchaVerified,
  setUploading,
  setUploadError,
  setCurrentUploadId,
  resetUpload,
} = uploadSlice.actions
export default uploadSlice.reducer
