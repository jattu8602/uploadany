'use client'

import { useEffect, useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface CaptchaProps {
  onVerify: (token: string) => void
  verified: boolean
  error?: string | null
}

export default function Captcha({ onVerify, verified, error }: CaptchaProps) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check if reCAPTCHA is configured
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey) {
      setRecaptchaError('reCAPTCHA not configured. Skipping verification.')
      setIsInitializing(false)
      // Auto-verify if not configured (for development)
      setTimeout(() => {
        onVerify('dev-token')
      }, 500)
      return
    }

    // Wait a bit for reCAPTCHA to initialize
    const timer = setTimeout(() => {
      setIsInitializing(false)

      if (!executeRecaptcha) {
        setRecaptchaError('reCAPTCHA not loaded. Please refresh the page.')
        return
      }

      if (!verified) {
        const handleVerify = async () => {
          try {
            const token = await executeRecaptcha('upload')
            if (token) {
              onVerify(token)
            }
          } catch (err: any) {
            console.error('reCAPTCHA error:', err)
            setRecaptchaError(err.message || 'Failed to verify CAPTCHA')
          }
        }
        handleVerify()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [executeRecaptcha, verified, onVerify])

  if (verified) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
        <AlertDescription className="text-xs sm:text-sm md:text-base text-green-800">
          CAPTCHA verified successfully
        </AlertDescription>
      </Alert>
    )
  }

  if (error || recaptchaError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        <AlertDescription className="text-xs sm:text-sm md:text-base">{error || recaptchaError}</AlertDescription>
      </Alert>
    )
  }

  if (isInitializing) {
    return (
      <Alert>
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        <AlertDescription className="text-xs sm:text-sm md:text-base">Initializing CAPTCHA...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
      <AlertDescription className="text-xs sm:text-sm md:text-base">Verifying CAPTCHA...</AlertDescription>
    </Alert>
  )
}
