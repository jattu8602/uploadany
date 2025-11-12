import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const { order_id, payment_id } = event.payload.payment.entity

    // Find payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: order_id },
      include: { upload: true },
    })

    if (!payment) {
      return NextResponse.json({ received: true })
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: payment_id,
        status: event.event === 'payment.captured' ? 'completed' : 'failed',
      },
    })

    // If payment completed, mark upload as paid
    if (event.event === 'payment.captured' && payment.upload) {
      await prisma.upload.update({
        where: { id: payment.upload.id },
        data: {
          isPaid: true,
          expiresAt: new Date('2099-12-31'), // Lifetime access
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

