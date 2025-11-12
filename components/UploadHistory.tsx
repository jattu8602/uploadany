'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  setLoading,
  setHistory,
  removeHistoryItem,
  clearHistory,
  setError,
} from '@/lib/slices/historySlice'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Trash2,
  ExternalLink,
  Loader2,
  Smartphone,
  Sparkles,
  Infinity,
} from 'lucide-react'
import QRCode from './QRCode'
import PaymentPrompt from './PaymentPrompt'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

export default function UploadHistory() {
  const dispatch = useAppDispatch()
  const { items, isLoading, error } = useAppSelector((state) => state.history)
  const deviceId = useAppSelector((state) => state.device.deviceId)
  const deviceName = useAppSelector((state) => state.device.deviceName)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [upgradeUploadId, setUpgradeUploadId] = useState<string | null>(null)

  useEffect(() => {
    if (deviceId) {
      fetchHistory()
    }
  }, [deviceId])

  const fetchHistory = async () => {
    if (!deviceId) return

    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await fetch(`/api/history?deviceId=${deviceId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history')
      }

      dispatch(setHistory(data.history))
    } catch (err: any) {
      // Only show error if it's not a network error or if it's a real server error
      const errorMessage = err.message || 'Failed to load history'
      // Don't show error for network issues - just silently fail
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        console.error('Network error loading history:', err)
        dispatch(setHistory([])) // Set empty history instead of error
      } else {
        dispatch(setError(errorMessage))
      }
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return

    try {
      const response = await fetch(`/api/upload/${uploadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete upload')
      }

      dispatch(removeHistoryItem(uploadId))
    } catch (err) {
      alert('Failed to delete upload')
    }
  }

  const handleClearAll = async () => {
    if (
      !confirm(
        'Are you sure you want to delete all uploads? This cannot be undone.'
      )
    )
      return

    try {
      // Delete all uploads
      const deletePromises = items.map((item) =>
        fetch(`/api/upload/${item.uploadId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        })
      )

      await Promise.all(deletePromises)
      dispatch(clearHistory())
    } catch (err) {
      alert('Failed to clear history')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert
          variant="destructive"
          className="border-2 border-destructive/50 bg-destructive/10"
        >
          <AlertDescription className="font-semibold text-destructive">
            {error}
          </AlertDescription>
        </Alert>
        {error.includes('Database') && (
          <p className="text-sm text-muted-foreground text-center">
            Please ensure DATABASE_URL is set in your Vercel environment
            variables.
          </p>
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="glass-card p-8 border-2 border-white/20 shadow-colorful">
        <p className="text-center text-lg text-muted-foreground font-medium">
          No upload history
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gradient-primary">
            Upload History
          </h2>
          {deviceName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-accent/20 border border-accent/30">
              <Smartphone className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                {deviceName}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          className="bg-gradient-error hover:opacity-90 text-white font-semibold shadow-glow"
        >
          Clear All
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          // Check if uploaded within 5 minutes
          const createdAt = new Date(item.createdAt)
          const now = new Date()
          const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60)
          const isRecentlyUploaded = minutesAgo <= 5

          return (
            <Card
              key={item.uploadId}
              className="glass-card p-5 border-2 border-white/20 shadow-colorful hover:border-white/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold bg-white/20 px-2 py-1 rounded text-foreground">
                      {item.uploadId}
                    </span>
                    {isRecentlyUploaded && (
                      <Badge className="bg-gradient-warning text-white font-semibold animate-pulse-glow">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recently Uploaded
                      </Badge>
                    )}
                    {item.isPrivate && (
                      <Badge className="bg-gradient-secondary text-white font-semibold">
                        Private
                      </Badge>
                    )}
                    {item.isPaid && (
                      <Badge className="bg-gradient-success text-white font-semibold">
                        Lifetime
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {item.fileCount} file(s), {item.textBoxCount} text box(es)
                    </p>
                    <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
                    <p>Expires: {new Date(item.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!item.isPaid && (
                    <Button
                      onClick={() => setUpgradeUploadId(item.uploadId)}
                      className="bg-gradient-success hover:opacity-90 text-white font-bold shadow-glow hover:shadow-colorful transition-all duration-300"
                      size="sm"
                    >
                      <Infinity className="h-4 w-4 mr-2" />
                      Upgrade to Lifetime
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedQR(item.uploadId)}
                    className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View QR
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.uploadId)}
                    className="bg-gradient-error hover:opacity-90 text-white font-semibold shadow-glow"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={selectedQR !== null}
        onOpenChange={() => setSelectedQR(null)}
      >
        <DialogContent className="glass-card border-2 border-white/30 shadow-colorful">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-primary">
              QR Code
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground/80">
              Scan this QR code to access your upload
            </DialogDescription>
          </DialogHeader>
          {selectedQR && (
            <QRCode
              url={`${
                process.env.NEXT_PUBLIC_APP_URL || window.location.origin
              }/view/${selectedQR}`}
              uploadId={selectedQR}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade to Lifetime Dialog */}
      <Dialog
        open={upgradeUploadId !== null}
        onOpenChange={() => setUpgradeUploadId(null)}
      >
        <DialogContent className="glass-card border-2 border-white/30 shadow-colorful">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-success">
              Upgrade to Lifetime Access
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground/80">
              Make this file publicly available lifetime in just 2 rupees pay
              now and get unlimited download access
            </DialogDescription>
          </DialogHeader>
          {upgradeUploadId && (
            <PaymentPrompt
              uploadId={upgradeUploadId}
              onSuccess={() => {
                setUpgradeUploadId(null)
                // Refresh history
                fetchHistory()
              }}
              onCancel={() => {
                setUpgradeUploadId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
