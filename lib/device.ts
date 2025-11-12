import { nanoid } from 'nanoid'

const DEVICE_ID_KEY = 'uploadany_device_id'

export interface DeviceInfo {
  deviceId: string
  userAgent: string
  language: string
  platform: string
}

/**
 * Generate a browser fingerprint based on available browser properties
 */
function generateFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Fingerprint', 2, 2)
  }
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|')

  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get or create device ID
 * Combines UUID with browser fingerprint for uniqueness
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server-device-id'
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    const uuid = nanoid(16)
    const fingerprint = generateFingerprint().substring(0, 8)
    deviceId = `${uuid}-${fingerprint}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

/**
 * Get device name from user agent
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') {
    return 'Unknown Device'
  }

  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()

  // Detect browser
  let browser = 'Browser'
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'

  // Detect OS/Device
  let device = 'Device'
  if (ua.includes('iphone') || ua.includes('ipod')) device = 'iPhone'
  else if (ua.includes('ipad')) device = 'iPad'
  else if (ua.includes('android')) device = 'Android'
  else if (ua.includes('mac')) device = 'Mac'
  else if (ua.includes('win')) device = 'Windows'
  else if (ua.includes('linux')) device = 'Linux'
  else if (platform.includes('mac')) device = 'Mac'
  else if (platform.includes('win')) device = 'Windows'
  else if (platform.includes('linux')) device = 'Linux'

  return `${device} - ${browser}`
}

/**
 * Get complete device information
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server-device-id',
      userAgent: 'server',
      language: 'en',
      platform: 'server',
    }
  }

  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
  }
}

/**
 * Initialize device ID in Redux store
 */
export function initializeDevice(dispatch: any) {
  if (typeof window === 'undefined') return

  const deviceId = getDeviceId()
  const deviceName = getDeviceName()
  dispatch({ type: 'device/setDeviceId', payload: deviceId })
  dispatch({ type: 'device/setDeviceName', payload: deviceName })
  dispatch({ type: 'device/initializeDevice' })
}
