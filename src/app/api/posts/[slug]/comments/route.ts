import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateCommentRequest, CreateCommentResponse } from '@/types/blog';
import { z } from 'zod';

// Validation schema for comment creation
const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content is too long'),
  parentId: z.string().optional(),
  // Guest comment fields
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestWebsite: z.string().url().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!slug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Slug parameter is required',
          message: 'Invalid request'
        },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = createCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Invalid comment data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { content, parentId, guestName, guestEmail, guestWebsite } = validationResult.data;

    // Check if post exists and allows comments
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Post not found',
          message: 'The post you are trying to comment on does not exist'
        },
        { status: 404 }
      );
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: parentId,
          postId: post.id,
        },
      });

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parent comment not found',
            message: 'The comment you are replying to does not exist'
          },
          { status: 400 }
        );
      }
    }

    // Prepare comment data
    const commentData: any = {
      content: content.trim(),
      postId: post.id,
      parentId: parentId || null,
      status: 'PENDING', // All comments start as pending for moderation
    };

    // Add user info if authenticated, otherwise use guest info
    if (session?.user) {
      commentData.authorId = session.user.id;
    } else {
      // For guest comments, require at least name and email
      if (!guestName || !guestEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'Guest information required',
            message: 'Name and email are required for guest comments'
          },
          { status: 400 }
        );
      }

      commentData.guestName = guestName.trim();
      commentData.guestEmail = guestEmail.trim().toLowerCase();
      if (guestWebsite) {
        commentData.guestWebsite = guestWebsite.trim();
      }
    }

    // Get request metadata for spam prevention
    const userAgent = request.headers.get('user-agent');
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    commentData.userAgent = userAgent;
    commentData.ipAddress = ipAddress;

    // Create the comment
    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const response: CreateCommentResponse = {
      success: true,
      message: 'Comment submitted successfully and is awaiting moderation',
      comment: {
        id: comment.id,
        content: comment.content,
        status: comment.status as 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH',
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author ? {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
        } : null,
        guestName: comment.guestName,
        guestEmail: comment.guestEmail,
        guestWebsite: comment.guestWebsite,
        replies: [], // New comments don't have replies yet
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create comment'
      },
      { status: 500 }
    );
  }
}