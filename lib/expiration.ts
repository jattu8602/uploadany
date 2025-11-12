/**
 * Calculate expiration date (24 hours from now)
 */
export function getExpirationDate(): Date {
  const now = new Date()
  now.setHours(now.getHours() + 24)
  return now
}

/**
 * Check if upload is expired
 */
export function isExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt)
}

/**
 * Check if upload can be accessed (not expired or paid)
 */
export function canAccess(expiresAt: Date, isPaid: boolean): boolean {
  return isPaid || !isExpired(expiresAt)
}

