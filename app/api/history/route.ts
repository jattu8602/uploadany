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
      qrCodeUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }/view/${upload.uploadId}`,
    }))

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('Get history error:', error)
    // Provide more specific error message
    const errorMessage = error?.message || 'Internal server error'
    // Check if it's a database connection error
    if (
      errorMessage.includes('connect') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('MongoNetworkError')
    ) {
      return NextResponse.json(
        {
          error:
            'Database connection failed. Please check your database configuration.',
        },
        { status: 500 }
      )
    }
    // Check if Prisma client is not generated
    if (
      errorMessage.includes('PrismaClient') ||
      errorMessage.includes('Cannot find module')
    ) {
      return NextResponse.json(
        {
          error:
            'Database client not initialized. Please run: npx prisma generate',
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
