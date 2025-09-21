import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogSearchParams } from '@/types/blog';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = (searchParams.get('sortBy') as BlogSearchParams['sortBy']) || 'recent';
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    
    // Validate pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(50, Math.max(1, limit));
    const skip = (validatedPage - 1) * validatedLimit;

    // Build sort order
    let orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      default: // 'recent'
        orderBy = { publishedAt: 'desc' };
    }

    // Build where clause
    const whereClause: any = {
      category: {
        slug,
        isActive: true,
      },
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: {
        lte: new Date(),
      },
    };

    // Add tag filter if specified
    if (tag) {
      whereClause.tags = {
        some: {
          slug: tag,
        },
      };
    }

    // Add search filter if specified
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    // Get total count for pagination
    const totalPosts = await prisma.post.count({
      where: whereClause,
    });

    // Get posts
    const posts = await prisma.post.findMany({
      where: whereClause,
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
          take: 5, // Limit tags to avoid overfetching
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
      orderBy,
      skip,
      take: validatedLimit,
    });

    // Transform the data
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

    const totalPages = Math.ceil(totalPosts / validatedLimit);
    const hasMore = validatedPage < totalPages;

    // Get available filters for this category
    const availableTags = await prisma.tag.findMany({
      where: {
        posts: {
          some: {
            category: {
              slug,
              isActive: true,
            },
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            publishedAt: {
              lte: new Date(),
            },
          },
        },
      },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            posts: {
              where: {
                category: {
                  slug,
                },
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
                publishedAt: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const transformedTags = availableTags.map(tag => ({
      name: tag.name,
      slug: tag.slug,
      count: tag._count.posts,
    }));

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalPosts,
        totalPages,
        hasMore,
      },
      filters: {
        tags: transformedTags,
      },
      sortBy,
      search,
      tag,
    });
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category posts' },
      { status: 500 }
    );
  }
}