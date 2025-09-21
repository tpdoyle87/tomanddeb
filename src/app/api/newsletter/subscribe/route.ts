import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = subscribeSchema.parse(body);

    // Get client IP and user agent for analytics
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(', ')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      // If they're unsubscribed, reactivate them
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        const updatedSubscriber = await prisma.subscriber.update({
          where: { email },
          data: {
            status: 'PENDING',
            name: name || existingSubscriber.name,
            source: source || existingSubscriber.source,
            ipAddress,
            userAgent,
            unsubscribedAt: null,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Please check your email to confirm your subscription.',
          subscriber: {
            email: updatedSubscriber.email,
            name: updatedSubscriber.name,
            status: updatedSubscriber.status,
          },
        });
      }

      // If already subscribed and confirmed
      if (existingSubscriber.status === 'CONFIRMED') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          subscriber: {
            email: existingSubscriber.email,
            name: existingSubscriber.name,
            status: existingSubscriber.status,
          },
        });
      }

      // If pending, just return success
      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your subscription.',
        subscriber: {
          email: existingSubscriber.email,
          name: existingSubscriber.name,
          status: existingSubscriber.status,
        },
      });
    }

    // Create new subscriber
    const newSubscriber = await prisma.subscriber.create({
      data: {
        email,
        name,
        status: 'PENDING',
        source: source || 'homepage',
        ipAddress,
        userAgent,
      },
    });

    // In a real app, you would send a confirmation email here
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Please check your email to confirm your subscription.',
      subscriber: {
        email: newSubscriber.email,
        name: newSubscriber.name,
        status: newSubscriber.status,
      },
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to subscribe to newsletter. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return newsletter statistics
    const stats = await prisma.subscriber.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const totalSubscribers = await prisma.subscriber.count({
      where: {
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      totalSubscribers,
      stats: stats.map(stat => ({
        status: stat.status,
        count: stat._count.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    );
  }
}