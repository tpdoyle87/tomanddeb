import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const pages = await prisma.page.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const data = await request.json();
    const {
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage,
      isPublished,
      sections,
    } = data;

    // Validate required fields
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'Slug, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.page.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        content,
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords || [],
        featuredImage,
        isPublished: isPublished ?? true,
        sections,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}