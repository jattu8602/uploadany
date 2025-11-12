import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isExpired } from '@/lib/expiration'

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
        textContent: {
          orderBy: { order: 'asc' },
        },
        payment: true,
      },
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Check if expired and not paid
    const expired = isExpired(upload.expiresAt)
    const canAccess = upload.isPaid || !expired

    return NextResponse.json({
      upload: {
        uploadId: upload.uploadId,
        isPrivate: upload.isPrivate,
        isPaid: upload.isPaid,
        expiresAt: upload.expiresAt.toISOString(),
        expired,
        canAccess,
        createdAt: upload.createdAt.toISOString(),
      },
      files: upload.files,
      textContent: upload.textContent,
      payment: upload.payment,
    })
  } catch (error) {
    console.error('Get upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
