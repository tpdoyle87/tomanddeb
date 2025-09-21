import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can manage posts
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Admin can access all posts - no additional check needed

    return NextResponse.json(post);

  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can manage posts
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const body = await request.json();

    // Check if post exists and user can edit it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, slug: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Admin can update any post - no additional check needed since requireAdmin already validated

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      visibility,
      categoryId,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      location,
      country,
      scheduledAt,
    } = body;

    // Check if slug is unique (if changed)
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Calculate read time if content is provided
    let readTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }

    // Prepare update data
    const updateData: any = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content && { content, readTime }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(status && { status }),
      ...(visibility && { visibility }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(metaKeywords && { metaKeywords }),
      ...(location !== undefined && { location }),
      ...(country !== undefined && { country }),
      updatedAt: new Date(),
    };

    // Handle status changes
    if (status) {
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      } else if (status === 'SCHEDULED' && scheduledAt) {
        updateData.scheduledAt = new Date(scheduledAt);
      }
    }

    // Handle tags
    if (tags) {
      updateData.tags = {
        set: [], // Remove all existing connections
        connect: tags.map((tagId: string) => ({ id: tagId })),
      };
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can manage posts
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Check if post exists and user can delete it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only admin or post author can delete
    // Admin can update any post - no additional check needed since requireAdmin already validated

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}