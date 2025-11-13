import type { Metadata } from 'next'

const sections = [
  {
    title: 'Digital Delivery Overview',
    description:
      'Upload Anytime provides instant digital delivery. Once your files are successfully uploaded and payment (if required) is confirmed, your QR code and shareable links are generated immediately.',
    bullets: [
      'No physical products are shipped.',
      'Access is available worldwide via secure web links.',
      'Delivery status can be tracked directly inside your upload history.',
    ],
  },
  {
    title: 'Processing Times',
    description:
      'Uploads are processed automatically in real time. Most users receive access within seconds. Larger files may require additional processing time, but we aim to complete every upload within a few minutes.',
    bullets: [
      'Private uploads and lifetime upgrades may trigger a brief verification while payment is confirmed.',
      'You will always see a live status indicator while an upload is being processed.',
    ],
  },
  {
    title: 'Access and Availability',
    description:
      'Your files remain accessible according to the retention period selected during upload. Lifetime access upgrades ensure your links stay active indefinitely.',
    bullets: [
      'Public uploads remain available until their scheduled expiry.',
      'Private uploads require the password you set during upload.',
      'Lifetime access purchases guarantee uninterrupted availability.',
    ],
  },
  {
    title: 'Support for Delivery Issues',
    description:
      'If you experience delays or cannot access your upload, contact us and include your upload ID for faster support. Our team will verify the upload status, restore access if possible, or advise on next steps.',
  },
]

export const metadata: Metadata = {
  title: 'Shipping Policy | Upload Anytime',
  description:
    'Understand how Upload Anytime delivers your digital files and manages availability across devices.',
}

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <header className="space-y-4 text-center md:text-left">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
          Shipping Policy
        </p>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
          Digital delivery, anywhere you need it.
        </h1>
        <p className="text-base text-white/80 md:text-lg">
          Upload Anytime delivers digital content instantly. Review how we process uploads, manage
          access, and keep your files available across devices.
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
          Need help accessing an upload?
        </h2>
        <p className="mt-3 text-sm text-white/80 md:text-base">
          Reach out with your upload ID and a short description of the issue. We typically respond
          within 24 hours.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-2 md:text-base">
          <a
            href="tel:+918602074069"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 transition hover:border-white/40"
          >
            Call us: +91 8602074069
          </a>
          <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
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
