/**
 * Image Placeholder Utilities
 * Using Unsplash Source API for beautiful placeholder images
 */

export const unsplashImages = {
  // Hero images
  hero: {
    upload: 'https://source.unsplash.com/featured/1920x1080/?upload,cloud,technology',
    files: 'https://source.unsplash.com/featured/1920x1080/?files,documents,modern',
    sharing: 'https://source.unsplash.com/featured/1920x1080/?sharing,network,connection',
    qrcode: 'https://source.unsplash.com/featured/1920x1080/?qrcode,digital,modern',
  },

  // Background patterns
  patterns: {
    abstract: 'https://source.unsplash.com/featured/800x600/?abstract,colorful,gradient',
    tech: 'https://source.unsplash.com/featured/800x600/?technology,digital,future',
    cloud: 'https://source.unsplash.com/featured/800x600/?cloud,sky,blue',
  },

  // Empty states
  empty: {
    noFiles: 'https://source.unsplash.com/featured/600x400/?empty,upload,add',
    noHistory: 'https://source.unsplash.com/featured/600x400/?history,time,clock',
    error: 'https://source.unsplash.com/featured/600x400/?error,alert,warning',
  },

  // Icons and thumbnails
  thumbnails: {
    upload: 'https://source.unsplash.com/featured/400x300/?upload,arrow,up',
    download: 'https://source.unsplash.com/featured/400x300/?download,arrow,down',
    share: 'https://source.unsplash.com/featured/400x300/?share,network,connection',
  },
}

/**
 * Get Unsplash image URL with custom dimensions
 */
export function getUnsplashImage(keyword: string, width = 1920, height = 1080): string {
  return `https://source.unsplash.com/featured/${width}x${height}/?${keyword}`
}

/**
 * Get random Unsplash image
 */
export function getRandomImage(category: 'nature' | 'technology' | 'abstract' = 'technology'): string {
  const keywords = {
    nature: 'nature,landscape,beautiful',
    technology: 'technology,digital,modern',
    abstract: 'abstract,colorful,art',
  }
  return `https://source.unsplash.com/featured/1920x1080/?${keywords[category]}`
}

