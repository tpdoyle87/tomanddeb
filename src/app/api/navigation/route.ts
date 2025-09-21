import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check for posts with specific tags and photos
    const [travelCount, worldschoolingCount, photoCount] = await Promise.all([
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          tags: {
            some: {
              name: {
                equals: 'Travel',
                mode: 'insensitive',
              },
            },
          },
        },
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          tags: {
            some: {
              name: {
                equals: 'Worldschooling',
                mode: 'insensitive',
              },
            },
          },
        },
      }),
      prisma.photo.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    const navigation = [
      { name: 'Home', href: '/', show: true },
      { name: 'Travel', href: '/travel', show: travelCount > 0 },
      { name: 'Worldschooling', href: '/worldschooling', show: worldschoolingCount > 0 },
      { name: 'Photography', href: '/photography', show: true },
      { name: 'About', href: '/about', show: true },
      { name: 'Contact', href: '/contact', show: true },
    ];

    return NextResponse.json(navigation.filter(item => item.show));
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    // Return default navigation on error
    return NextResponse.json([
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ]);
  }
}