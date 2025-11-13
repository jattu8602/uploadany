'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  Lock,
  Image as ImageIcon,
  FileText,
  Video,
  Package,
  Copy,
  Share2,
  Check,
  ArrowLeft,
  Home,
  Upload,
} from 'lucide-react'
import PaymentPrompt from '@/components/PaymentPrompt'
import QRCode from '@/components/QRCode'
import { isExpired, canAccess } from '@/lib/expiration'

interface File {
  id: string
  name: string
  originalName: string
  url: string
  type: string
  mimeType: string
  size: number
}

interface TextContent {
  id: string
  title: string
  content: string
}

interface UploadData {
  upload: {
    uploadId: string
    isPrivate: boolean
    isPaid: boolean
    expiresAt: string
    expired: boolean
    canAccess: boolean
  }
  files: File[]
  textContent: TextContent[]
}

export default function ViewPage() {
  const params = useParams()
  const router = useRouter()
  const uploadId = params.uploadId as string
  const [data, setData] = useState<UploadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if password was already verified in this session
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem(`password_verified_${uploadId}`)
      if (verified === 'true') {
        setPasswordVerified(true)
      }
    }
    fetchUpload()
  }, [uploadId])

  const fetchUpload = async () => {
    try {
      const response = await fetch(`/api/upload/${uploadId}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to load upload')
        return
      }

      setData(result)

      // Check if payment is needed
      if (result.upload.expired && !result.upload.isPaid) {
        setShowPayment(true)
      }
    } catch (err) {
      setError('Failed to load upload')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    try {
      const response = await fetch(`/api/upload/${uploadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.error || 'Invalid password')
        return
      }

      // Password verified - store in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`password_verified_${uploadId}`, 'true')
      }
      setPasswordVerified(true)

      // Refresh data to get full content
      fetchUpload()
    } catch (err) {
      setPasswordError('Failed to verify password')
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Fetch the file
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: try direct download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadAll = async () => {
    if (!data) return

    try {
      const response = await fetch(`/api/download/${uploadId}`)
      if (!response.ok) throw new Error('Failed to generate ZIP')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `upload-${uploadId}.zip`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-5 w-5" />
    if (type === 'video') return <Video className="h-5 w-5" />
    if (type === 'document') return <FileText className="h-5 w-5" />
    return <Package className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl font-bold pacifico-regular text-white drop-shadow-2xl">
            Upload Anytime
          </div>
          <div className="text-lg text-white/90 font-semibold">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          <Card className="glass-card p-8 border-2 border-destructive/50 shadow-colorful">
            <Alert
              variant="destructive"
              className="border-2 border-destructive/50 bg-destructive/10"
            >
              <AlertDescription className="font-semibold text-destructive text-lg">
                {error}
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          <Card className="glass-card p-8 border-2 border-white/30 shadow-colorful">
            <Alert className="border-2 border-warning/50 bg-warning/10">
              <AlertDescription className="font-semibold text-foreground text-lg">
                Upload not found
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    )
  }

  const { upload, files, textContent } = data

  // Password protection - MUST verify password first for private uploads
  if (upload.isPrivate && !passwordVerified) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold pacifico-regular text-white drop-shadow-2xl mb-4">
              Upload Anytime
            </h1>
            <p className="text-lg text-white/90 font-semibold">
              Protected Content
            </p>
          </div>
          <Card className="glass-card p-8 border-2 border-white/30 shadow-colorful">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-secondary/30 border-2 border-secondary/50 shadow-glow">
                <Lock className="h-10 w-10 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-gradient-secondary text-center">
                Password Protected
              </h2>
              <p className="text-sm text-muted-foreground text-center font-medium">
                This upload is password protected. Please enter the password to
                access the content.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 border-2 border-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30 text-lg py-6 text-center font-semibold placeholder:text-muted-foreground/60"
                  autoFocus
                />
              </div>
              {passwordError && (
                <Alert
                  variant="destructive"
                  className="border-2 border-destructive/50 bg-destructive/10"
                >
                  <AlertDescription className="font-semibold text-destructive">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow hover:shadow-colorful transition-all duration-300"
              >
                <Lock className="h-5 w-5 mr-2" />
                Unlock Access
              </Button>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  // Check access for expired uploads
  if (!upload.canAccess && !showPayment) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert>
          <AlertDescription>
            This upload has expired. Pay ₹2 to access it permanently.
          </AlertDescription>
        </Alert>
        <PaymentPrompt
          uploadId={uploadId}
          onSuccess={() => {
            setShowPayment(false)
            fetchUpload()
          }}
        />
      </div>
    )
  }

  // Show payment prompt if expired
  if (showPayment && upload.expired && !upload.isPaid) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert>
          <AlertDescription>
            This upload has expired. Pay ₹2 to access it permanently.
          </AlertDescription>
        </Alert>
        <PaymentPrompt
          uploadId={uploadId}
          onSuccess={() => {
            setShowPayment(false)
            fetchUpload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-4xl space-y-3 sm:space-y-6">
      {/* Back Button at Top */}
      <div className="flex items-center justify-between py-2 sm:py-4 gap-2">
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Upload File</span>
          <span className="sm:hidden">Upload</span>
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300 text-xs sm:text-sm"
        >
          <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Home
        </Button>
      </div>

      <div className="flex items-center justify-between py-3 sm:py-6 flex-wrap gap-2 sm:gap-4">
        <div>
          <Link href="/">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold pacifico-regular text-white drop-shadow-2xl mb-1 sm:mb-2 hover:opacity-80 transition-opacity cursor-pointer">
              Upload Files
            </h1>
          </Link>
          {files.length > 0 && (
            <p className="text-sm sm:text-base md:text-lg text-white/90 font-semibold">
              Files ({files.length})
            </p>
          )}
        </div>
        {files.length > 0 && (
          <Button
            onClick={handleDownloadAll}
            className="bg-gradient-accent hover:opacity-90 text-white font-bold text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 shadow-glow hover:shadow-colorful transition-all duration-300"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Download All as ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {upload.isPrivate && (
          <Alert className="glass-card border-2 border-secondary/50 bg-secondary/10 shadow-colorful flex-1">
            <Lock className="h-5 w-5 text-secondary" />
            <AlertDescription className="font-semibold text-foreground">
              This upload is password protected
            </AlertDescription>
          </Alert>
        )}

        {upload.isPaid && (
          <Badge className="bg-gradient-success text-white font-bold px-4 py-2 text-base shadow-glow">
            Lifetime Access
          </Badge>
        )}
      </div>

      {/* Files */}
      {files.length > 0 && (
        <div className="space-y-2 sm:space-y-4">
          <div className="grid gap-2 sm:gap-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className="glass-card p-3 sm:p-4 md:p-5 border-2 border-white/20 shadow-colorful hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 rounded-lg bg-gradient-primary/20 flex-shrink-0">
                      <div className="h-4 w-4 sm:h-5 sm:w-5">
                        {getFileIcon(file.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
                    {file.type === 'image' && (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="hidden sm:block w-12 h-12 md:w-20 md:h-20 object-contain rounded-lg border-2 border-white/20 flex-shrink-0"
                      />
                    )}
                    <Button
                      onClick={() =>
                        handleDownload(file.url, file.originalName)
                      }
                      className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Download</span>
                      <span className="sm:hidden">DL</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Text Content */}
      {textContent.length > 0 && (
        <div className="space-y-2 sm:space-y-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gradient-secondary">
            Text Content ({textContent.length})
          </h2>
          <div className="space-y-2 sm:space-y-4">
            {textContent.map((text) => (
              <Card
                key={text.id}
                className="glass-card p-3 sm:p-4 md:p-6 border-2 border-white/20 shadow-colorful"
              >
                <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-gradient-primary">
                  {text.title}
                </h3>
                <div
                  className="prose prose-xs sm:prose-sm md:prose-base max-w-none text-xs sm:text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: text.content }}
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && textContent.length === 0 && (
        <Alert>
          <AlertDescription>No content available</AlertDescription>
        </Alert>
      )}

      {/* QR Code and Share Section */}
      <div className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t-2 border-white/20">
        <div className="grid md:grid-cols-2 gap-3 sm:gap-6 items-start">
          {/* QR Code - Desktop: Left, Mobile: Full width */}
          <div className="w-full">
            <QRCode
              url={`${
                typeof window !== 'undefined' ? window.location.origin : ''
              }/view/${uploadId}`}
              uploadId={uploadId}
            />
          </div>

          {/* Share Section - Desktop: Right, Mobile: Below QR */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gradient-primary mb-2 sm:mb-4">
              Share this upload
            </h3>

            {/* Copyable Link */}
            <Card className="glass-card p-2 sm:p-3 md:p-4 border-2 border-white/20 shadow-colorful">
              <div className="flex items-center gap-1 sm:gap-2">
                <Input
                  value={`${
                    typeof window !== 'undefined' ? window.location.origin : ''
                  }/view/${uploadId}`}
                  readOnly
                  className="flex-1 bg-white/50 border-2 border-white/30 text-xs sm:text-sm font-mono"
                />
                <Button
                  onClick={async () => {
                    const url = `${window.location.origin}/view/${uploadId}`
                    try {
                      await navigator.clipboard.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch (err) {
                      console.error('Failed to copy:', err)
                    }
                  }}
                  className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Share Button */}
            <Button
              onClick={async () => {
                const url = `${window.location.origin}/view/${uploadId}`
                const title = 'Check out this upload'
                const text = `View files and content shared via Upload Anytime`

                if (navigator.share) {
                  try {
                    await navigator.share({
                      title,
                      text,
                      url,
                    })
                  } catch (err) {
                    // User cancelled or error occurred
                    console.log('Share cancelled or failed:', err)
                  }
                } else {
                  // Fallback: copy to clipboard
                  try {
                    await navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  } catch (err) {
                    console.error('Failed to copy:', err)
                  }
                }
              }}
              className="w-full bg-gradient-secondary hover:opacity-90 text-white font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-6 shadow-glow hover:shadow-colorful transition-all duration-300"
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Share
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Share this link or QR code to let others access this upload
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
