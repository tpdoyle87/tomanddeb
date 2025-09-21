import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating photos
const updatePhotoSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  dateTaken: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  lens: z.string().optional().nullable(),
  focalLength: z.string().optional().nullable(),
  aperture: z.string().optional().nullable(),
  shutterSpeed: z.string().optional().nullable(),
  iso: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional(),
  webpUrl: z.string().url().optional(),
  fullResUrl: z.string().url().optional(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),
});

// GET /api/admin/photos/[id] - Get a single photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/photos/[id] - Update a photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePhotoSchema.parse(body);

    const { id } = await params;
    
    // Check if photo exists
    const existing = await prisma.photo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // If updating slug, check if new slug is unique
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.photo.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A photo with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Convert date string to Date object if provided
    const photoData: any = { ...validatedData };
    if (photoData.dateTaken) {
      photoData.dateTaken = new Date(photoData.dateTaken);
    }

    // Update publishedAt based on status
    if (photoData.status === 'PUBLISHED' && !existing.publishedAt) {
      photoData.publishedAt = new Date();
    } else if (photoData.status === 'DRAFT') {
      photoData.publishedAt = null;
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: photoData,
    });

    return NextResponse.json(photo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/photos/[id] - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    await prisma.photo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}