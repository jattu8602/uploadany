import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uploadId } =
      await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !uploadId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Get upload
    const upload = await prisma.upload.findUnique({
      where: { uploadId },
      include: { payment: true },
    })

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Update payment record
    if (upload.payment) {
      await prisma.payment.update({
        where: { id: upload.payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'completed',
        },
      })
    }

    // Mark upload as paid and remove expiration
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        isPaid: true,
        expiresAt: new Date('2099-12-31'), // Far future date for lifetime access
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

