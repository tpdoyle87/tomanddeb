import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = parseInt(searchParams.get('skip') || '0');

    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: {
          lte: new Date(), // Only show posts that are actually published
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readTime: true,
        views: true,
        location: true,
        country: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
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
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      skip,
    });

    // Transform the data to match the expected format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      views: post.views,
      location: post.location,
      country: post.country,
      author: post.author,
      category: post.category,
      tags: post.tags,
      commentCount: post._count.comments,
    }));

    return NextResponse.json({
      posts: transformedPosts,
      total: transformedPosts.length,
      hasMore: transformedPosts.length === limit, // Simple check for pagination
    });
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}