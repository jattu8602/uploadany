'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Copy, Check } from 'lucide-react'

interface QRCodeProps {
  url: string
  uploadId: string
}

export default function QRCode({ url, uploadId }: QRCodeProps) {
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(256)

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setQrSize(160)
        } else if (window.innerWidth < 1024) {
          setQrSize(200)
        } else {
          setQrSize(256)
        }
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${uploadId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card className="glass-card p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center gap-3 sm:gap-4 md:gap-6 border-2 border-white/20 shadow-colorful">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-lg blur-xl" />
        <div className="relative bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-glow border-2 border-primary/20">
          <QRCodeSVG
            id="qr-code-svg"
            value={url}
            size={qrSize}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
      <div className="text-center space-y-2 sm:space-y-3 w-full">
        <p className="text-sm sm:text-base md:text-lg font-bold text-gradient-primary">Scan to view files</p>
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          <Input
            value={url}
            readOnly
            className="flex-1 bg-white/50 border-2 border-white/30 text-xs font-mono text-center"
          />
          <Button
            onClick={copyLink}
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
      </div>
      <Button
        onClick={downloadQR}
        className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300 text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3"
      >
        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Download QR Code</span>
        <span className="sm:hidden">Download</span>
      </Button>
    </Card>
  )
}

