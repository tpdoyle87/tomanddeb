import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RelatedPostsResponse, BlogPost } from '@/types/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '4')));

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // First, get the current post to understand its attributes
    const currentPost = await prisma.post.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      select: {
        id: true,
        categoryId: true,
        tags: {
          select: {
            id: true,
          },
        },
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const tagIds = currentPost.tags.map(tag => tag.id);

    // Build related posts query with weighted scoring
    // Priority: 1. Same category + shared tags, 2. Same category, 3. Shared tags, 4. Same author
    const relatedPostsQueries = [];

    // Query 1: Posts in same category with shared tags (highest priority)
    if (currentPost.categoryId && tagIds.length > 0) {
      relatedPostsQueries.push(
        prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            id: { not: currentPost.id },
            categoryId: currentPost.categoryId,
            tags: {
              some: {
                id: { in: tagIds },
              },
            },
          },
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
          orderBy: { views: 'desc' },
          take: limit,
        })
      );
    }

    // Query 2: Posts in same category (medium-high priority)
    if (currentPost.categoryId) {
      relatedPostsQueries.push(
        prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            id: { not: currentPost.id },
            categoryId: currentPost.categoryId,
          },
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
          orderBy: { publishedAt: 'desc' },
          take: limit,
        })
      );
    }

    // Query 3: Posts with shared tags (medium priority)
    if (tagIds.length > 0) {
      relatedPostsQueries.push(
        prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            id: { not: currentPost.id },
            tags: {
              some: {
                id: { in: tagIds },
              },
            },
          },
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
          orderBy: { views: 'desc' },
          take: limit,
        })
      );
    }

    // Query 4: Posts by same author (low priority)
    relatedPostsQueries.push(
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          id: { not: currentPost.id },
          authorId: currentPost.author.id,
        },
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
        orderBy: { publishedAt: 'desc' },
        take: limit,
      })
    );

    // Execute all queries in parallel
    const queryResults = await Promise.all(relatedPostsQueries);

    // Combine and deduplicate results, maintaining priority order
    const seenPostIds = new Set<string>();
    const relatedPosts: any[] = [];

    for (const posts of queryResults) {
      for (const post of posts) {
        if (!seenPostIds.has(post.id) && relatedPosts.length < limit) {
          seenPostIds.add(post.id);
          relatedPosts.push(post);
        }
      }
    }

    // If we still don't have enough posts, get recent popular posts
    if (relatedPosts.length < limit) {
      const remainingLimit = limit - relatedPosts.length;
      const fallbackPosts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          id: { 
            not: currentPost.id,
            notIn: Array.from(seenPostIds),
          },
        },
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
        orderBy: [
          { views: 'desc' },
          { publishedAt: 'desc' },
        ],
        take: remainingLimit,
      });

      relatedPosts.push(...fallbackPosts);
    }

    // Format the response
    const formattedPosts: BlogPost[] = relatedPosts.map(post => ({
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
      tags: post.tags.map((tag: any) => ({
        name: tag.name,
        slug: tag.slug,
      })),
      commentCount: post._count.comments,
    }));

    const response: RelatedPostsResponse = {
      posts: formattedPosts,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch related posts'
      },
      { status: 500 }
    );
  }
}