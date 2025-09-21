import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Posts stats
    const [totalPosts, publishedPosts, draftPosts, postsThisMonth, postsLastMonth] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.post.count({ 
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lte: endOfLastMonth 
          } 
        } 
      }),
    ]);

    // Subscribers stats
    const [totalSubscribers, subscribersThisMonth, subscribersLastMonth] = await Promise.all([
      prisma.subscriber.count({ where: { status: 'CONFIRMED' } }),
      prisma.subscriber.count({ 
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: startOfMonth } 
        } 
      }),
      prisma.subscriber.count({ 
        where: { 
          status: 'CONFIRMED',
          createdAt: { 
            gte: startOfLastMonth, 
            lte: endOfLastMonth 
          } 
        } 
      }),
    ]);

    // Views stats
    const totalViews = await prisma.post.aggregate({
      _sum: { views: true }
    });

    const viewsThisMonth = await prisma.post.aggregate({
      _sum: { views: true },
      where: {
        updatedAt: { gte: startOfMonth }
      }
    });

    // Comments stats
    const [totalComments, pendingComments] = await Promise.all([
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'PENDING' } }),
    ]);

    // Journal stats
    const [totalJournal, journalThisMonth] = await Promise.all([
      prisma.journalEntry.count(),
      prisma.journalEntry.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    // Media stats
    const [totalMedia, mediaStorageResult] = await Promise.all([
      prisma.image.count(),
      prisma.image.aggregate({
        _sum: { size: true }
      }),
    ]);

    const mediaStorage = mediaStorageResult._sum.size || 0;
    const mediaStorageMB = Math.round(mediaStorage / 1024 / 1024 * 100) / 100;

    const stats = {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        thisMonth: postsThisMonth,
      },
      subscribers: {
        total: totalSubscribers,
        thisMonth: subscribersThisMonth,
      },
      views: {
        total: totalViews._sum.views || 0,
        thisMonth: viewsThisMonth._sum.views || 0,
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
      },
      journal: {
        total: totalJournal,
        thisMonth: journalThisMonth,
      },
      media: {
        total: totalMedia,
        storage: `${mediaStorageMB} MB`,
      },
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}