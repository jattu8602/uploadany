import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    const uploads = await prisma.upload.findMany({
      where: { deviceId },
      include: {
        files: true,
        textContent: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const history = uploads.map((upload) => ({
      uploadId: upload.uploadId,
      deviceId: upload.deviceId,
      fileCount: upload.files.length,
      textBoxCount: upload.textContent.length,
      isPrivate: upload.isPrivate,
      isPaid: upload.isPaid,
      expiresAt: upload.expiresAt.toISOString(),
      createdAt: upload.createdAt.toISOString(),
      qrCodeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/view/${upload.uploadId}`,
    }))

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

