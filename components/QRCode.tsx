'use client'

import { useState } from 'react'
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
    <Card className="glass-card p-8 flex flex-col items-center gap-6 border-2 border-white/20 shadow-colorful">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-lg blur-xl" />
        <div className="relative bg-white p-6 rounded-xl shadow-glow border-2 border-primary/20">
          <QRCodeSVG
            id="qr-code-svg"
            value={url}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
      <div className="text-center space-y-3 w-full">
        <p className="text-lg font-bold text-gradient-primary">Scan to view files</p>
        <div className="flex items-center gap-2 w-full">
          <Input
            value={url}
            readOnly
            className="flex-1 bg-white/50 border-2 border-white/30 text-xs font-mono text-center"
          />
          <Button
            onClick={copyLink}
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow flex-shrink-0"
            size="sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      <Button
        onClick={downloadQR}
        className="bg-gradient-accent hover:opacity-90 text-white font-semibold shadow-glow hover:shadow-colorful transition-all duration-300"
      >
        <Download className="h-4 w-4 mr-2" />
        Download QR Code
      </Button>
    </Card>
  )
}

