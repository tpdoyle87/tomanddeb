import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ViewCountResponse } from '@/types/blog';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Check if post exists and is published
    const existingPost = await prisma.post.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      select: {
        id: true,
        views: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    const updatedPost = await prisma.post.update({
      where: {
        id: existingPost.id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    });

    const response: ViewCountResponse = {
      success: true,
      views: updatedPost.views,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        views: 0,
      },
      { status: 500 }
    );
  }
}