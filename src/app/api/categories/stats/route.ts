import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get categories with post counts
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            posts: {
              where: {
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
        order: 'asc',
      },
    });

    // Transform the data to include post counts
    const categoriesWithStats = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      postCount: category._count.posts,
    }));

    // Get total statistics
    const totalPosts = await prisma.post.count({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: {
          lte: new Date(),
        },
      },
    });

    const totalCategories = categories.length;

    // Get most popular category (by post count)
    const mostPopularCategory = categoriesWithStats.reduce((prev, current) => 
      prev.postCount > current.postCount ? prev : current
    );

    return NextResponse.json({
      categories: categoriesWithStats,
      stats: {
        totalPosts,
        totalCategories,
        mostPopularCategory: mostPopularCategory || null,
      },
    });
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category statistics' },
      { status: 500 }
    );
  }
}