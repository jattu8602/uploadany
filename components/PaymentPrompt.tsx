'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentPromptProps {
  uploadId: string
  onSuccess: () => void
  onCancel?: () => void
}

export default function PaymentPrompt({ uploadId, onSuccess, onCancel }: PaymentPromptProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create payment order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, reason: 'lifetime_access' }),
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create payment')
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Upload Anytime',
        description: 'Lifetime Access - ₹2',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              uploadId,
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok && verifyData.success) {
            onSuccess()
          } else {
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      razorpay.on('payment.failed', function (response: any) {
        setError('Payment failed. Please try again.')
        setLoading(false)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card p-6 space-y-4 border-2 border-white/20 shadow-colorful">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-gradient-primary">Unlock Lifetime Access</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Pay ₹2 to access this upload permanently. One-time payment, lifetime access.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-2 border-destructive/50">
          <AlertDescription className="font-semibold">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-gradient-success hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow hover:shadow-colorful transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={loading}
            className="flex-1 bg-white/50 border-2 border-white/30 hover:bg-white/70 text-foreground font-bold text-lg py-6 transition-all duration-300 disabled:opacity-50"
          >
            Back to Public Upload
          </Button>
        )}
      </div>
    </Card>
  )
}

