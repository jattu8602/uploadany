'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface QRCodeProps {
  url: string
  uploadId: string
}

export default function QRCode({ url, uploadId }: QRCodeProps) {
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
      <div className="text-center space-y-3">
        <p className="text-lg font-bold text-gradient-primary">Scan to view files</p>
        <p className="text-xs font-mono break-all bg-white/10 p-2 rounded border border-white/20 text-foreground">
          {url}
        </p>
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

