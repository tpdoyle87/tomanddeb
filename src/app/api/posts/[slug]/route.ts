import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DetailedBlogPost } from '@/types/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Get post with all related data
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            website: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            caption: true,
            width: true,
            height: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        comments: {
          where: {
            status: 'APPROVED',
            parentId: null, // Only top-level comments, replies will be nested
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              where: {
                status: 'APPROVED',
              },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                status: 'APPROVED',
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Format coordinates if they exist
    let coordinates = null;
    if (post.coordinates && typeof post.coordinates === 'object') {
      const coords = post.coordinates as any;
      if (coords.lat && coords.lng) {
        coordinates = { lat: coords.lat, lng: coords.lng };
      }
    }

    // Format the response to match DetailedBlogPost interface
    const detailedPost: DetailedBlogPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt || post.createdAt,
      readTime: post.readTime,
      views: post.views,
      location: post.location,
      country: post.country,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
      canonicalUrl: post.canonicalUrl,
      coordinates,
      author: {
        id: post.author.id,
        name: post.author.name,
        image: post.author.image,
        bio: post.author.bio,
        website: post.author.website,
      },
      category: post.category ? {
        name: post.category.name,
        slug: post.category.slug,
      } : null,
      tags: post.tags.map(tag => ({
        name: tag.name,
        slug: tag.slug,
      })),
      images: post.images,
      comments: post.comments.map(comment => ({
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
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          status: reply.status as 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH',
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          author: reply.author ? {
            id: reply.author.id,
            name: reply.author.name,
            image: reply.author.image,
          } : null,
          guestName: reply.guestName,
          guestEmail: reply.guestEmail,
          guestWebsite: reply.guestWebsite,
        })),
      })),
      commentCount: post._count.comments,
    };

    return NextResponse.json({
      success: true,
      post: detailedPost,
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch post'
      },
      { status: 500 }
    );
  }
}