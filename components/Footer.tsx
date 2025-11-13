import Link from 'next/link'

const phoneNumber = '8602074069'
const contactEmails = ['chaurasiyajatin68@gmail.com', 'chaurasiyanitesh68@gmail.com']

const policyLinks = [
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/cancellation-and-refund', label: 'Cancellation & Refund' },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/20 bg-white/10 backdrop-blur-md text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 md:max-w-sm">
            <p className="text-3xl font-semibold pacifico-regular drop-shadow-lg">
              Upload Anytime
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Seamlessly upload, manage, and share your content with QR codes accessible from
              any device. Built to keep your files handy everywhere you go.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold drop-shadow">Contact Us</h3>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`tel:+91${phoneNumber}`}
                className="transition-colors hover:text-white"
              >
                +91 {phoneNumber}
              </a>
              {contactEmails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="transition-colors hover:text-white break-all"
                >
                  {email}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold drop-shadow">Policies</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Upload Anytime. All rights reserved.</p>
          <p className="sm:text-right">
            Crafted for reliable, mobile-first file sharing and storage.
          </p>
        </div>
      </div>
    </footer>
  )
}
