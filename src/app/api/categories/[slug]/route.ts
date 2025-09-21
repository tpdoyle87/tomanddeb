import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get category details with post count
    const category = await prisma.category.findUnique({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        metaTitle: true,
        metaDescription: true,
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
        children: {
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
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const categoryWithStats = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      postCount: category._count.posts,
      subcategories: category.children.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        postCount: child._count.posts,
      })),
      parent: category.parent,
    };

    return NextResponse.json({
      category: categoryWithStats,
    });
  } catch (error) {
    console.error('Error fetching category details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category details' },
      { status: 500 }
    );
  }
}