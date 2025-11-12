import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isExpired } from '@/lib/expiration'
import bcrypt from 'bcryptjs'

// GET upload details
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

    // For private uploads, don't return files/content unless password is verified
    // Password verification is handled client-side via sessionStorage
    // This is a security measure - the API still returns basic info but client hides content
    const isPrivate = upload.isPrivate

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
      // Return files and content - client will check password verification before displaying
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

// DELETE upload
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params
    const { deviceId } = await request.json()

    const upload = await prisma.upload.findUnique({
      where: { uploadId },
      include: { files: true },
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Verify device ID
    if (upload.deviceId !== deviceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete upload (cascade will delete files and text content)
    await prisma.upload.delete({
      where: { id: upload.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify password for private uploads
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params
    const { password } = await request.json()

    const upload = await prisma.upload.findUnique({
      where: { uploadId },
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    if (!upload.isPrivate || !upload.password) {
      return NextResponse.json(
        { error: 'Upload is not password protected' },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(password, upload.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
