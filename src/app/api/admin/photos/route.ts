import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating/updating photos
const photoSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  dateTaken: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  lens: z.string().optional().nullable(),
  focalLength: z.string().optional().nullable(),
  aperture: z.string().optional().nullable(),
  shutterSpeed: z.string().optional().nullable(),
  iso: z.string().optional().nullable(),
  thumbnailUrl: z.string().url(),
  webpUrl: z.string().url(),
  fullResUrl: z.string().url(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),
});

// GET /api/admin/photos - List all photos with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.photo.count({ where }),
    ]);

    return NextResponse.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/photos - Create a new photo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = photoSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.photo.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A photo with this slug already exists' },
        { status: 400 }
      );
    }

    // Convert date string to Date object if provided
    const photoData: any = { ...validatedData };
    if (photoData.dateTaken) {
      photoData.dateTaken = new Date(photoData.dateTaken);
    }

    // Set publishedAt if status is PUBLISHED
    if (photoData.status === 'PUBLISHED' && !photoData.publishedAt) {
      photoData.publishedAt = new Date();
    }

    const photo = await prisma.photo.create({
      data: photoData,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/photos - Bulk delete photos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No photo IDs provided' },
        { status: 400 }
      );
    }

    const result = await prisma.photo.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} photos`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error deleting photos:', error);
    return NextResponse.json(
      { error: 'Failed to delete photos' },
      { status: 500 }
    );
  }
}