import { v2 as cloudinary } from 'cloudinary'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Cloudflare R2 (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''

export interface UploadResult {
  url: string
  provider: 'cloudinary' | 'r2'
  publicId?: string
  key?: string
}

/**
 * Determine file type based on MIME type and extension
 */
export function getFileType(mimeType: string, fileName: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'

  const ext = fileName.toLowerCase().split('.').pop()
  const executableExts = ['apk', 'aab', 'exe', 'dmg', 'pkg', 'deb', 'rpm']
  const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']

  if (executableExts.includes(ext || '')) return 'executable'
  if (documentExts.includes(ext || '')) return 'document'

  return 'other'
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const fileType = getFileType(mimeType, fileName)
    const resourceType = fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'raw'

    // Convert buffer to base64 data URL if needed
    let uploadData: string
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64')
      uploadData = `data:${mimeType};base64,${base64}`
    } else {
      uploadData = file
    }

    const result = await cloudinary.uploader.upload(uploadData, {
      resource_type: resourceType,
      folder: 'uploadany',
      use_filename: true,
      unique_filename: true,
    })

    return {
      url: result.secure_url,
      provider: 'cloudinary',
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const key = `uploadany/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })

    await r2Client.send(command)

    const url = `${R2_PUBLIC_URL}/${key}`

    return {
      url,
      provider: 'r2',
      key,
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    throw error
  }
}

/**
 * Smart file upload router
 * - Images/videos <100MB → Cloudinary
 * - Large files/executables → R2
 * - Fallback to R2 if Cloudinary fails
 */
export async function uploadFile(
  file: File
): Promise<UploadResult> {
  const fileSizeMB = file.size / (1024 * 1024)
  const fileType = getFileType(file.type, file.name)
  const isExecutable = fileType === 'executable'
  const isLargeFile = fileSizeMB >= 100

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Strategy: Use Cloudinary for images/videos <100MB, R2 for large files/executables
  if ((fileType === 'image' || fileType === 'video') && !isLargeFile && !isExecutable) {
    try {
      return await uploadToCloudinary(buffer, file.name, file.type)
    } catch (error) {
      console.warn('Cloudinary upload failed, falling back to R2:', error)
      // Fallback to R2
      return await uploadToR2(buffer, file.name, file.type)
    }
  } else {
    // Use R2 for large files, executables, and other file types
    return await uploadToR2(buffer, file.name, file.type)
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  url: string,
  provider: 'cloudinary' | 'r2',
  publicId?: string,
  key?: string
): Promise<void> {
  try {
    if (provider === 'cloudinary' && publicId) {
      await cloudinary.uploader.destroy(publicId)
    } else if (provider === 'r2' && key) {
      // R2 deletion would require DeleteObjectCommand
      // For now, we'll just log it
      console.log('R2 file deletion not implemented yet:', key)
    }
  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}

