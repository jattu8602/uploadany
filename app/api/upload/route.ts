import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile, getFileType } from '@/lib/storage'
import { getExpirationDate } from '@/lib/expiration'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

// Verify reCAPTCHA token
async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured')
    return true // Allow in development
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${token}`,
      }
    )
    const data = await response.json()
    return data.success && data.score > 0.5
  } catch (error) {
    console.error('CAPTCHA verification error:', error)
    return false
  }
}

const uploadSchema = z.object({
  deviceId: z.string(),
  captchaToken: z.string(),
  isPrivate: z.boolean(),
  password: z.string().optional(),
  textBoxes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
    })
  ).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Parse JSON metadata
    const metadataStr = formData.get('metadata') as string
    if (!metadataStr) {
      return NextResponse.json(
        { error: 'Metadata is required' },
        { status: 400 }
      )
    }

    const metadata = JSON.parse(metadataStr)
    const validated = uploadSchema.parse(metadata)

    // Verify CAPTCHA
    const captchaValid = await verifyCaptcha(validated.captchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed' },
        { status: 400 }
      )
    }

    // Validate files
    const files: File[] = []
    let fileIndex = 0
    while (formData.has(`file_${fileIndex}`)) {
      const file = formData.get(`file_${fileIndex}`) as File
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 100MB limit` },
          { status: 400 }
        )
      }
      files.push(file)
      fileIndex++
    }

    if (files.length === 0 && (!validated.textBoxes || validated.textBoxes.length === 0)) {
      return NextResponse.json(
        { error: 'At least one file or text box is required' },
        { status: 400 }
      )
    }

    // Generate unique upload ID
    const uploadId = nanoid(12)

    // Hash password if private
    let hashedPassword: string | null = null
    if (validated.isPrivate && validated.password) {
      hashedPassword = await bcrypt.hash(validated.password, 10)
    }

    // Create upload record
    const expiresAt = getExpirationDate()
    const upload = await prisma.upload.create({
      data: {
        uploadId,
        deviceId: validated.deviceId,
        isPrivate: validated.isPrivate,
        password: hashedPassword,
        isPaid: false,
        expiresAt,
      },
    })

    // Upload files
    const fileRecords = []
    for (const file of files) {
      try {
        const result = await uploadFile(file)
        const fileType = getFileType(file.type, file.name)

        const fileRecord = await prisma.file.create({
          data: {
            uploadId: upload.id,
            name: result.url,
            originalName: file.name,
            url: result.url,
            storageProvider: result.provider,
            size: file.size,
            mimeType: file.type,
            type: fileType,
          },
        })
        fileRecords.push(fileRecord)
      } catch (error) {
        console.error('File upload error:', error)
        // Continue with other files
      }
    }

    // Save text content
    if (validated.textBoxes && validated.textBoxes.length > 0) {
      for (let i = 0; i < validated.textBoxes.length; i++) {
        const textBox = validated.textBoxes[i]
        await prisma.textContent.create({
          data: {
            uploadId: upload.id,
            title: textBox.title || `Text ${i + 1}`,
            content: textBox.content,
            order: i,
          },
        })
      }
    }

    // If private, create payment record
    if (validated.isPrivate) {
      await prisma.payment.create({
        data: {
          uploadId: upload.id,
          razorpayOrderId: '', // Will be set when payment is initiated
          amount: 200, // ₹2 = 200 paise
          status: 'pending',
        },
      })
    }

    return NextResponse.json({
      success: true,
      uploadId,
      expiresAt: expiresAt.toISOString(),
      requiresPayment: validated.isPrivate,
    })
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

