'use client'

import { useCallback, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Upload, File as FileIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addFiles, removeFile } from '@/lib/slices/uploadSlice'

export default function FileUploadZone() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.upload.files)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return

      const fileArray = Array.from(fileList)
      dispatch(addFiles(fileArray))
    },
    [dispatch]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-4">
      <Card
        className={`relative border-[3px] border-dashed p-4 sm:p-6 md:p-10 text-center transition-all duration-300 overflow-hidden glass-card ${
          isDragging
            ? 'border-primary bg-gradient-primary/20 shadow-glow animate-pulse-glow scale-105'
            : 'border-white/50 bg-white/20 hover:border-white/80 hover:bg-white/30 shadow-colorful'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-primary opacity-20 animate-gradient" />
        )}
        <div className="relative z-10">
          <Upload
            className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto mb-3 sm:mb-4 md:mb-6 transition-transform duration-300 ${
              isDragging
                ? 'text-primary scale-125 drop-shadow-lg'
                : 'text-primary/80 drop-shadow-md'
            }`}
          />
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-foreground drop-shadow-sm">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs sm:text-sm md:text-base text-foreground/80 mb-4 sm:mb-6 md:mb-8 font-medium">
            Supports images, videos, documents, APKs, and more (max 100MB per
            file)
          </p>
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          <Button
            type="button"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300 text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            Select Files
          </Button>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-white">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file) => (
              <Card
                key={file.id}
                className="glass-card p-2 sm:p-3 md:p-4 border-2 border-white/20 shadow-colorful hover:border-white/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary/20 flex-shrink-0">
                      <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs sm:text-sm md:text-base text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(removeFile(file.id))}
                    className="flex-shrink-0 hover:bg-destructive/20 hover:text-destructive transition-colors h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
