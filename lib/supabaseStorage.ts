import { supabase } from '@/utils/supabaseClient'
import { createClient } from '@supabase/supabase-js'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (optional, will generate if not provided)
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: File,
  bucket: string = 'package-image',
  path?: string
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    if (path) formData.append('path', path)

    const response = await fetch('/api/admin/storage/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: err.error || 'Upload failed' }
    }

    const data = await response.json()
    return { success: true, url: data.url }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 * @returns Promise with deletion result
 */
export async function deleteImage(
  url: string,
  bucket: string = 'package-image'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/storage/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, bucket })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: err.error || 'Delete failed' }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Validate if file is a valid image
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns Validation result
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' }
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size too large. Maximum size is ${maxSizeMB}MB.` }
  }
  return { valid: true }
}
