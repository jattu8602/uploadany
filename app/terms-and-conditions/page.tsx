import type { Metadata } from 'next'
import Link from 'next/link'

type Section = {
  title: string
  description: string
  bullets?: string[]
}

const sections: Section[] = [
  {
    title: 'Acceptance of Terms',
    description:
      'By accessing Upload Anytime, you agree to abide by these Terms & Conditions and any applicable laws. Continued use of the service signifies your acceptance of updates as they are published.',
    bullets: [
      'You must be at least 13 years of age or have parental consent to use the platform.',
      'Any misuse that violates legal or platform guidelines may result in restricted access.',
    ],
  },
  {
    title: 'User Responsibilities',
    description:
      'You are responsible for the content you upload, share, and distribute. Ensure your files comply with copyright laws, privacy rules, and third-party rights.',
    bullets: [
      'Do not upload malicious code, offensive content, or unauthorized intellectual property.',
      'Keep access credentials (passwords for private uploads) secure and confidential.',
      'Respect other users and avoid activities that could disrupt the service.',
    ],
  },
  {
    title: 'Payments and Upgrades',
    description:
      'Some features, including private uploads and lifetime availability, require one-time payments. All transactions are processed securely through our payment partners.',
    bullets: [
      'Fees are displayed clearly before you complete a transaction.',
      'Successful payments enable the corresponding feature immediately after confirmation.',
      'Refer to the Cancellation & Refund Policy to understand refund eligibility.',
    ],
  },
  {
    title: 'Service Availability',
    description:
      'We strive for 24/7 service availability but cannot guarantee uninterrupted access. Planned maintenance or unexpected outages may temporarily limit functionality.',
    bullets: [
      'We provide updates through in-app notices or email when scheduled maintenance could impact uploads.',
      'We are not liable for losses arising from outages, but we work to restore service promptly.',
    ],
  },
  {
    title: 'Privacy and Data',
    description:
      'We collect minimal data necessary to provide and improve the service. Uploaded content is stored securely, and private uploads are encrypted and password protected.',
    bullets: [
      'Review our privacy guidelines in the app to understand what information we store.',
      'You retain ownership of your content; we only store it to fulfill the service.',
      'Delete uploads at any time through your history for immediate removal.',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Terms & Conditions | Upload Anytime',
  description:
    'Review the terms that govern how you use Upload Anytime, manage uploads, and interact with other users.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-2 sm:px-4 py-8 sm:py-12 md:py-16">
      <header className="space-y-2 sm:space-y-3 md:space-y-4 text-center md:text-left">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">
          Terms & Conditions
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
          Know your responsibilities while using Upload Anytime.
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-white/80">
          These terms outline how Upload Anytime operates, what you can expect
          from us, and how to keep your account secure and compliant.
        </p>
      </header>

      <div className="mt-6 sm:mt-8 md:mt-10 space-y-3 sm:space-y-4 md:space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="glass-card rounded-2xl border border-white/20 p-3 sm:p-4 md:p-6 shadow-colorful"
          >
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black">
              {section.title}
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-black">
              {section.description}
            </p>
            {section.bullets && (
              <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base text-black">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-1.5 sm:gap-2">
                    <span className="mt-1 h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0 rounded-full bg-black" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 md:mt-12 glass-card rounded-2xl border border-white/20 p-3 sm:p-4 md:p-6 shadow-colorful">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-black">
          Questions or clarifications?
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-black">
          We are here to help. If you need clarity on these terms, or if you
          believe someone is misusing the platform, let us know right away.
        </p>
        <div className="mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-black md:flex-row">
          <a
            href="tel:+918602074069"
            className="rounded-xl border border-white/20 bg-white/10 px-3 sm:px-4 py-2 sm:py-3 transition hover:border-white/40 text-xs sm:text-sm md:text-base"
          >
            Call us: +91 8602074069
          </a>
          <div className="space-y-1 rounded-xl border border-white/20 bg-white/10 px-3 sm:px-4 py-2 sm:py-3">
            <p className="font-medium text-black text-xs sm:text-sm md:text-base">
              Email support
            </p>
            <a
              href="mailto:chaurasiyajatin68@gmail.com"
              className="block break-all text-black transition hover:text-gray-700 text-xs sm:text-sm"
            >
              chaurasiyajatin68@gmail.com
            </a>
            <a
              href="mailto:chaurasiyanitesh68@gmail.com"
              className="block break-all text-black transition hover:text-gray-700 text-xs sm:text-sm"
            >
              chaurasiyanitesh68@gmail.com
            </a>
          </div>
        </div>
        <p className="mt-4 sm:mt-6 text-xs text-black">
          For policy-specific questions, you can also review our{' '}
          <Link
            href="/shipping-policy"
            className="underline underline-offset-4 text-black hover:text-gray-700"
          >
            Shipping Policy
          </Link>{' '}
          and{' '}
          <Link
            href="/cancellation-and-refund"
            className="underline underline-offset-4 text-black hover:text-gray-700"
          >
            Cancellation & Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
