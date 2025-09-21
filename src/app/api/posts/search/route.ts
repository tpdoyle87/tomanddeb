import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogSearchResponse, BlogPost } from '@/types/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const author = searchParams.get('author') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const includeFilters = searchParams.get('includeFilters') === 'true';

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    // Add search query filter
    if (query.trim()) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          location: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          country: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add category filter
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Add tag filter
    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    // Add author filter
    if (author) {
      where.author = {
        id: author,
      };
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute parallel queries
    const [posts, total, filters] = await Promise.all([
      // Get posts
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
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
      }),

      // Get total count
      prisma.post.count({ where }),

      // Get filter data if requested
      includeFilters ? Promise.all([
        // Categories with post counts
        prisma.category.findMany({
          where: {
            posts: {
              some: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                posts: {
                  where: {
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                  },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        }),

        // Tags with post counts
        prisma.tag.findMany({
          where: {
            posts: {
              some: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                posts: {
                  where: {
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                  },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        }),

        // Authors with post counts
        prisma.user.findMany({
          where: {
            posts: {
              some: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                posts: {
                  where: {
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                  },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
      ]) : null,
    ]);

    // Format posts data
    const formattedPosts: BlogPost[] = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt || post.createdAt,
      readTime: post.readTime,
      views: post.views,
      location: post.location,
      country: post.country,
      author: {
        name: post.author.name,
        image: post.author.image,
      },
      category: post.category ? {
        name: post.category.name,
        slug: post.category.slug,
      } : null,
      tags: post.tags.map(tag => ({
        name: tag.name,
        slug: tag.slug,
      })),
      commentCount: post._count.comments,
    }));

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Build response
    const response: BlogSearchResponse = {
      posts: formattedPosts,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    };

    // Add filters if requested
    if (includeFilters && filters) {
      const [categories, tags, authors] = filters;
      response.filters = {
        categories: categories.map(cat => ({
          name: cat.name,
          slug: cat.slug,
          count: cat._count.posts,
        })),
        tags: tags.map(tag => ({
          name: tag.name,
          slug: tag.slug,
          count: tag._count.posts,
        })),
        authors: authors.map(author => ({
          name: author.name || 'Unknown',
          id: author.id,
          count: author._count.posts,
        })),
      };
    }

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to search posts'
      },
      { status: 500 }
    );
  }
}