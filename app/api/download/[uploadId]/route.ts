import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'
import { isExpired, canAccess } from '@/lib/expiration'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params
    const upload = await prisma.upload.findUnique({
      where: { uploadId },
      include: {
        files: true,
        textContent: true,
      },
    })

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Check access
    if (!canAccess(upload.expiresAt, upload.isPaid)) {
      return NextResponse.json(
        { error: 'Upload has expired. Payment required.' },
        { status: 403 }
      )
    }

    const zip = new JSZip()

    // Add files
    for (const file of upload.files) {
      try {
        const response = await fetch(file.url)
        if (!response.ok) continue

        const arrayBuffer = await response.arrayBuffer()
        zip.file(file.originalName, arrayBuffer)
      } catch (error) {
        console.error(`Failed to fetch file ${file.originalName}:`, error)
      }
    }

    // Add text content as files
    for (let i = 0; i < upload.textContent.length; i++) {
      const text = upload.textContent[i]
      const title = text.title || `text_${i + 1}`
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.html`
      zip.file(filename, text.content)
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const buffer = await zipBlob.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="upload-${uploadId}.zip"`,
      },
    })
  } catch (error) {
    console.error('ZIP download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate ZIP' },
      { status: 500 }
    )
  }
}

