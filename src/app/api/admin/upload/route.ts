import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { uploadToGCS } from '@/lib/services/gcs';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

// Increase the body size limit to 50MB
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    console.log('Admin authorized for upload');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const alt = formData.get('alt') as string || '';
    const caption = formData.get('caption') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Processing file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, type: ${file.type}`);

    // Generate base filename without extension
    const filenameParts = file.name.split('.');
    const extension = filenameParts.pop();
    const baseFilename = filenameParts.join('.');

    // Upload original image
    console.log('Uploading original image...');
    const { publicUrl: originalUrl, fileName: originalFileName } = await uploadToGCS(
      buffer,
      file.name,
      file.type,
      {
        folder,
        isPublic: true,
        metadata: {
          uploadedBy: authResult.id,
          originalName: file.name,
          version: 'original',
        },
      }
    );
    console.log(`Original uploaded: ${originalUrl}`);

    let webpUrl = '';
    let webpFileName = '';

    // Create and upload WebP version (skip if already WebP or SVG)
    if (file.type !== 'image/webp' && file.type !== 'image/svg+xml') {
      try {
        console.log('Converting to WebP...');
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer();
        
        const webpFilename = `${baseFilename}.webp`;
        console.log(`WebP conversion complete, size: ${(webpBuffer.length / (1024 * 1024)).toFixed(2)}MB`);

        const { publicUrl, fileName } = await uploadToGCS(
          webpBuffer,
          webpFilename,
          'image/webp',
          {
            folder,
            isPublic: true,
            metadata: {
              uploadedBy: authResult.id,
              originalName: file.name,
              version: 'webp',
            },
          }
        );
        webpUrl = publicUrl;
        webpFileName = fileName;
        console.log(`WebP uploaded: ${webpUrl}`);
      } catch (error) {
        console.error('Failed to create WebP version:', error);
        // Continue without WebP version
      }
    }

    // Get image dimensions
    let width = 0;
    let height = 0;
    try {
      if (file.type !== 'image/svg+xml') {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
      }
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
    }

    // Save image record to database
    const image = await prisma.image.create({
      data: {
        url: originalUrl, // Always store original URL as primary
        webpUrl: webpUrl || null, // Store WebP URL separately
        filename: originalFileName, // Keep original filename
        mimeType: file.type, // Keep original mime type
        size: file.size,
        width,
        height,
        alt,
        caption,
        provider: 'S3', // Using S3 enum value for GCS
        uploadedBy: authResult.id,
        folder,
        tags: [],
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        url: image.url,
        webpUrl: image.webpUrl,
        filename: image.filename,
        alt: image.alt,
        caption: image.caption,
        width,
        height,
      },
    });
  } catch (error) {
    console.error('Upload error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}