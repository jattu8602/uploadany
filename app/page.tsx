'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { initializeDevice } from '@/lib/device'
import {
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
} from '@/lib/slices/uploadSlice'
import { addHistoryItem } from '@/lib/slices/historySlice'
import FileUploadZone from '@/components/FileUploadZone'
import TextEditor from '@/components/TextEditor'
import Captcha from '@/components/Captcha'
import QRCode from '@/components/QRCode'
import UploadHistory from '@/components/UploadHistory'
import PaymentPrompt from '@/components/PaymentPrompt'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Loader2, Lock, Infinity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { nanoid } from 'nanoid'

export default function Home() {
  const dispatch = useAppDispatch()
  const deviceId = useAppSelector((state) => state.device.deviceId)
  const uploadState = useAppSelector((state) => state.upload)
  const [showQR, setShowQR] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [currentUploadId, setCurrentUploadIdState] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeDevice(dispatch)
    }
  }, [dispatch])

  const handleAddTextBox = () => {
    const id = nanoid()
    dispatch(addTextBox({ id, title: `Text ${uploadState.textBoxes.length + 1}` }))
  }

  const handlePrivacyChange = (value: string) => {
    const isPrivate = value === 'private'
    dispatch(setPrivacy({ isPrivate, password: '' }))

    if (isPrivate) {
      // Don't set currentUploadId here - payment will be shown before upload
      setShowPayment(true)
    }
  }

  const handleCaptchaVerify = (token: string) => {
    dispatch(setCaptchaVerified({ verified: true, token }))
  }

  const handleUpload = async () => {
    if (uploadState.files.length === 0 && uploadState.textBoxes.length === 0) {
      dispatch(setUploadError('Please add at least one file or text box'))
      return
    }

    if (!uploadState.captchaVerified) {
      dispatch(setUploadError('Please complete CAPTCHA verification'))
      return
    }

    if (!deviceId) {
      dispatch(setUploadError('Device ID not initialized'))
      return
    }

    dispatch(setUploading(true))
    dispatch(setUploadError(null))

    try {
      // Prepare form data
      const formData = new FormData()

      // Add files
      uploadState.files.forEach((fileItem, index) => {
        formData.append(`file_${index}`, fileItem.file)
      })

      // Add metadata
      const metadata = {
        deviceId,
        captchaToken: uploadState.captchaToken,
        isPrivate: uploadState.isPrivate,
        password: uploadState.isPrivate ? uploadState.password : undefined,
        textBoxes: uploadState.textBoxes.map((tb) => ({
          id: tb.id,
          title: tb.title,
          content: tb.content,
        })),
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Success
      const uploadId = result.uploadId
      setCurrentUploadIdState(uploadId)
      dispatch(setCurrentUploadId(uploadId))

      // Add to history
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      dispatch(
        addHistoryItem({
          uploadId,
          deviceId,
          fileCount: uploadState.files.length,
          textBoxCount: uploadState.textBoxes.length,
          isPrivate: uploadState.isPrivate,
          isPaid: false,
          expiresAt: result.expiresAt,
          createdAt: new Date().toISOString(),
          qrCodeUrl: `${baseUrl}/view/${uploadId}`,
        })
      )

      // Clear form for better UX - user can start new upload immediately
      dispatch(resetUpload())

      // Show QR code
      setShowQR(true)

      // If private or lifetime access requested, show payment prompt
      if (result.requiresPayment || uploadState.wantsLifetimeAccess) {
        setCurrentUploadIdState(uploadId)
        setShowPayment(true)
      }
    } catch (error: any) {
      dispatch(setUploadError(error.message || 'Upload failed'))
    } finally {
      dispatch(setUploading(false))
    }
  }

  const handleCloseQR = () => {
    setShowQR(false)
    dispatch(resetUpload())
    setCurrentUploadIdState(null)
  }

  const canUpload =
    (uploadState.files.length > 0 || uploadState.textBoxes.length > 0) &&
    uploadState.captchaVerified &&
    !uploadState.isUploading

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-6xl pacifico-regular text-white drop-shadow-2xl">
          Upload Anytime
        </h1>
        <p className="text-xl text-white/95 font-semibold drop-shadow-lg">
          Upload anything, share via QR code. No login required.
        </p>
      </div>

      {/* File Upload Zone */}
      <Card className="glass-card p-6 shadow-colorful border-2 border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Files</h2>
        <FileUploadZone />
      </Card>

      {/* Text Boxes */}
      <Card className="glass-card p-6 shadow-colorful border-2 border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gradient-secondary">Text Content</h2>
          <Button
            onClick={handleAddTextBox}
            className="bg-gradient-secondary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Text Box
          </Button>
        </div>
        <div className="space-y-4">
          {uploadState.textBoxes.map((textBox) => (
            <TextEditor
              key={textBox.id}
              id={textBox.id}
              title={textBox.title}
              content={textBox.content}
              onTitleChange={(id, title) =>
                dispatch(updateTextBox({ id, title }))
              }
              onContentChange={(id, content) =>
                dispatch(updateTextBox({ id, content }))
              }
              onRemove={(id) => dispatch(removeTextBox(id))}
            />
          ))}
          {uploadState.textBoxes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No text boxes added. Click &quot;Add Text Box&quot; to get started.
            </p>
          )}
        </div>
      </Card>

        {/* Privacy Settings */}
        <Card className="glass-card p-6 shadow-colorful border-2 border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gradient-secondary">Privacy Settings</h2>
          <div className="space-y-5">
            <div>
              <Label className="text-base font-semibold text-foreground mb-2 block">Access Control</Label>
              <Select
                value={uploadState.isPrivate ? 'private' : 'public'}
                onValueChange={handlePrivacyChange}
              >
                <SelectTrigger className="bg-white/50 border-2 border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-2 border-white/30 shadow-colorful">
                  <SelectItem value="public" className="text-base py-3">Public (Anyone with QR can access)</SelectItem>
                  <SelectItem value="private" className="text-base py-3">
                    Private (Password protected - ₹2 required)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uploadState.isPrivate && (
              <div>
                <Label className="text-base font-semibold text-foreground mb-2 block">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={uploadState.password}
                  onChange={(e) =>
                    dispatch(setPrivacy({ isPrivate: true, password: e.target.value }))
                  }
                  className="bg-white/50 border-2 border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base"
                />
              </div>
            )}

            {/* Lifetime Access Toggle */}
            <div className="pt-4 border-t-2 border-white/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-foreground mb-2 block">
                    Lifetime Access
                  </Label>
                  <p className="text-sm text-muted-foreground font-medium">
                    Make this file publicly available lifetime in just 2 rupees pay now and get unlimited download access
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const newValue = !uploadState.wantsLifetimeAccess
                    dispatch(setWantsLifetimeAccess(newValue))
                    // Payment will be shown after upload completes
                  }}
                  className={`flex-shrink-0 ${
                    uploadState.wantsLifetimeAccess
                      ? 'bg-gradient-success hover:opacity-90 text-white'
                      : 'bg-white/50 border-2 border-white/30 hover:bg-white/70 text-foreground'
                  } font-semibold shadow-glow transition-all duration-300`}
                  variant={uploadState.wantsLifetimeAccess ? 'default' : 'outline'}
                >
                  <Infinity className="h-4 w-4 mr-2" />
                  {uploadState.wantsLifetimeAccess ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

      {/* CAPTCHA */}
      {(uploadState.files.length > 0 || uploadState.textBoxes.length > 0) && (
        <Card className="glass-card p-6 shadow-colorful border-2 border-white/20">
          <h2 className="text-2xl font-bold mb-4 text-gradient-accent">Verification</h2>
          <Captcha
            onVerify={handleCaptchaVerify}
            verified={uploadState.captchaVerified}
            error={uploadState.uploadError}
          />
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleUpload}
          disabled={!canUpload}
          size="lg"
          className="w-full max-w-md bg-gradient-primary hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow hover:shadow-colorful transition-all duration-300 disabled:opacity-50"
        >
          {uploadState.isUploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload & Generate QR Code'
          )}
        </Button>
      </div>

      {uploadState.uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadState.uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload History */}
      <Card className="glass-card p-6 shadow-colorful border-2 border-white/20">
        <UploadHistory />
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md glass-card border-2 border-white/30 shadow-colorful">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-primary">Upload Complete!</DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground/80">
              Scan this QR code to access your upload
            </DialogDescription>
          </DialogHeader>
          {currentUploadId && (
            <div className="space-y-6">
              <QRCode
                url={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/view/${currentUploadId}`}
                uploadId={currentUploadId}
              />
              {uploadState.isPrivate && (
                <Alert className="glass-card border-2 border-warning/50 bg-warning/10">
                  <Lock className="h-4 w-4 text-warning" />
                  <AlertDescription className="font-semibold text-foreground">
                    This upload is password protected. Payment required.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleCloseQR}
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow hover:shadow-colorful transition-all duration-300"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="glass-card border-2 border-white/30 shadow-colorful">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-secondary">
              {uploadState.wantsLifetimeAccess ? 'Lifetime Access Payment' : 'Payment Required'}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground/80">
              {uploadState.wantsLifetimeAccess
                ? 'Pay ₹2 to make this upload publicly available for lifetime with unlimited download access'
                : 'Private uploads require a one-time payment of ₹2'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentUploadId ? (
              <PaymentPrompt
                uploadId={currentUploadId}
                onSuccess={() => {
                  setShowPayment(false)
                  dispatch(setWantsLifetimeAccess(false))
                  // Refresh history
                  window.location.reload()
                }}
                onCancel={() => {
                  if (uploadState.wantsLifetimeAccess) {
                    dispatch(setWantsLifetimeAccess(false))
                  }
                  setShowPayment(false)
                }}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">
                  {uploadState.wantsLifetimeAccess
                    ? 'Make this file publicly available lifetime in just 2 rupees pay now and get unlimited download access. Payment will be processed after upload completes.'
                    : 'To make your upload private and password-protected, you need to pay ₹2. This is a one-time payment for lifetime access.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowPayment(false)
                      // User can continue - payment will be handled after upload
                    }}
                    className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow hover:shadow-colorful transition-all duration-300"
                  >
                    Continue
                  </Button>
                  <Button
                    onClick={() => {
                      if (uploadState.wantsLifetimeAccess) {
                        dispatch(setWantsLifetimeAccess(false))
                      } else {
                        dispatch(setPrivacy({ isPrivate: false, password: '' }))
                      }
                      setShowPayment(false)
                    }}
                    variant="outline"
                    className="flex-1 bg-white/50 border-2 border-white/30 hover:bg-white/70 text-foreground font-bold text-lg py-6 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
