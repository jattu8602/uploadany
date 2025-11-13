import type { Metadata } from 'next'

type Section = {
  title: string
  description: string
  bullets?: string[]
}

const sections: Section[] = [
  {
    title: 'Eligibility for Cancellation',
    description:
      'Because Upload Anytime delivers digital content instantly, cancellations are only available before files finish uploading or before payment is captured.',
    bullets: [
      'If an upload is still processing, you can cancel it directly from the interface.',
      'Once a QR code is generated or a download link is active, the upload is considered delivered.',
    ],
  },
  {
    title: 'Refund Conditions',
    description:
      'We review refund requests on a case-by-case basis. Refunds are granted when technical issues on our end prevent access to your content and cannot be resolved promptly.',
    bullets: [
      'Requests must be submitted within 7 days of the transaction.',
      'Provide your upload ID, payment reference, and a detailed description of the issue.',
      'Approved refunds are processed to the original payment method within 5-7 business days.',
    ],
  },
  {
    title: 'Non-refundable Situations',
    description:
      'To protect the integrity of the platform, we do not offer refunds under the following circumstances:',
    bullets: [
      'You entered incorrect information (e.g., wrong password) when configuring private uploads.',
      'You shared your access credentials and a third party misused them.',
      'The content was successfully delivered and accessible, but you no longer need the files.',
    ],
  },
  {
    title: 'Requesting Support',
    description:
      'If you believe you are eligible for a refund or need help recovering access, contact us with supporting information. We aim to resolve every request quickly and fairly.',
  },
]

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Upload Anytime',
  description:
    'Learn how Upload Anytime handles cancellations, refund requests, and eligibility for digital deliveries.',
}

export default function CancellationAndRefundPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <header className="space-y-4 text-center md:text-left">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
          Cancellation & Refund Policy
        </p>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
          Transparency for every digital delivery.
        </h1>
        <p className="text-base text-white/80 md:text-lg">
          Understand when you can cancel an upload, how to request a refund, and how we ensure fair
          resolutions for every customer.
        </p>
      </header>

      <div className="mt-10 space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="glass-card rounded-2xl border border-white/20 p-6 shadow-colorful"
          >
            <h2 className="text-xl font-semibold text-gradient-primary md:text-2xl">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 md:text-base">
              {section.description}
            </p>
            {section.bullets && (
              <ul className="mt-4 space-y-2 text-sm text-white/80 md:text-base">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 glass-card rounded-2xl border border-white/20 p-6 shadow-colorful">
        <h2 className="text-lg font-semibold text-gradient-secondary md:text-xl">
          Start a refund request
        </h2>
        <p className="mt-3 text-sm text-white/80 md:text-base">
          Send us your request with supporting details, including screenshots if available. We will
          respond within one business day.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-2 md:text-base">
          <a
            href="tel:+918602074069"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 transition hover:border-white/40"
          >
            Call us: +91 8602074069
          </a>
          <div className="space-y-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <p className="font-medium text-white">Email support</p>
            <a
              href="mailto:chaurasiyajatin68@gmail.com"
              className="block break-all transition hover:text-white"
            >
              chaurasiyajatin68@gmail.com
            </a>
            <a
              href="mailto:chaurasiyanitesh68@gmail.com"
              className="block break-all transition hover:text-white"
            >
              chaurasiyanitesh68@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
