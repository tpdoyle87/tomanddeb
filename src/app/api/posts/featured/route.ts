import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1');

    // First, try to find posts that might be marked as featured in the future
    // For now, we'll use the most recent post with high view count or recent publication
    const featuredPosts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: {
          lte: new Date(),
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
      orderBy: [
        { views: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });

    // If no posts with views, fallback to most recent
    if (featuredPosts.length === 0) {
      const recentPosts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          publishedAt: {
            lte: new Date(),
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
      });

      const transformedPosts = recentPosts.map(post => ({
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
      });
    }

    // Transform the featured posts data
    const transformedPosts = featuredPosts.map(post => ({
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
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured posts' },
      { status: 500 }
    );
  }
}