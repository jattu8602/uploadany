/**
 * Colorful Theme Configuration
 * Vibrant color palette for Upload Anytime
 */

export const colors = {
  // Primary gradients
  primary: {
    from: '#667eea',
    to: '#764ba2',
    solid: '#667eea',
  },
  // Secondary gradients
  secondary: {
    from: '#f093fb',
    to: '#f5576c',
    solid: '#f093fb',
  },
  // Accent gradients
  accent: {
    from: '#4facfe',
    to: '#00f2fe',
    solid: '#4facfe',
  },
  // Success gradients
  success: {
    from: '#43e97b',
    to: '#38f9d7',
    solid: '#43e97b',
  },
  // Warning gradients
  warning: {
    from: '#fa709a',
    to: '#fee140',
    solid: '#fa709a',
  },
  // Error gradients
  error: {
    from: '#ff6b6b',
    to: '#ee5a6f',
    solid: '#ff6b6b',
  },
}

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.from} 0%, ${colors.primary.to} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary.from} 0%, ${colors.secondary.to} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.from} 0%, ${colors.accent.to} 100%)`,
  success: `linear-gradient(135deg, ${colors.success.from} 0%, ${colors.success.to} 100%)`,
  warning: `linear-gradient(135deg, ${colors.warning.from} 0%, ${colors.warning.to} 100%)`,
  error: `linear-gradient(135deg, ${colors.error.from} 0%, ${colors.error.to} 100%)`,
  background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
  card: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)`,
}

export const shadows = {
  sm: '0 2px 8px rgba(102, 126, 234, 0.1)',
  md: '0 4px 16px rgba(102, 126, 234, 0.15)',
  lg: '0 8px 32px rgba(102, 126, 234, 0.2)',
  colorful: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(118, 75, 162, 0.1)',
  glow: '0 0 20px rgba(102, 126, 234, 0.4)',
}

export const animations = {
  gradient: 'gradient-shift 3s ease infinite',
  pulse: 'pulse-glow 2s ease-in-out infinite',
  shimmer: 'shimmer 2s linear infinite',
}

