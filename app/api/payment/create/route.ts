import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(request: NextRequest) {
  try {
    const { uploadId, reason } = await request.json()

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
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

    // Check if already paid
    if (upload.isPaid) {
      return NextResponse.json(
        { error: 'Upload is already paid' },
        { status: 400 }
      )
    }

    // Create or get payment record
    let payment = upload.payment
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          uploadId: upload.id,
          razorpayOrderId: '',
          amount: 200, // ₹2 = 200 paise
          status: 'pending',
        },
      })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 200, // ₹2 in paise
      currency: 'INR',
      receipt: `upload_${uploadId}_${Date.now()}`,
      notes: {
        uploadId,
        reason: reason || 'lifetime_access',
      },
    })

    // Update payment record with order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayOrderId: order.id,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}

