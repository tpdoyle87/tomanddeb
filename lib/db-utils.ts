import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

// User utilities
export const userUtils = {
  async createUser(data: {
    email: string
    password: string
    name?: string
    role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'READER'
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword)
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },
}

// Post utilities
export const postUtils = {
  async getPublishedPosts(options?: {
    take?: number
    skip?: number
    categoryId?: string
    tagId?: string
  }) {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
        ...(options?.categoryId && { categoryId: options.categoryId }),
        ...(options?.tagId && {
          tags: {
            some: { id: options.tagId },
          },
        }),
      },
      take: options?.take || 10,
      skip: options?.skip || 0,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
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
    })
  },

  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        category: true,
        tags: true,
        images: true,
        comments: {
          where: {
            status: 'APPROVED',
            parentId: null,
          },
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
            replies: {
              where: {
                status: 'APPROVED',
              },
              include: {
                author: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Increment view count
    if (post && post.status === 'PUBLISHED') {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
    }

    return post
  },

  async searchPosts(query: string) {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        category: true,
      },
    })
  },

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  },
}

// Comment utilities
export const commentUtils = {
  async createComment(data: {
    postId: string
    content: string
    authorId?: string
    guestName?: string
    guestEmail?: string
    parentId?: string
  }) {
    return prisma.comment.create({
      data: {
        ...data,
        status: data.authorId ? 'APPROVED' : 'PENDING', // Auto-approve authenticated users
      },
    })
  },

  async approveComment(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { status: 'APPROVED' },
    })
  },

  async getPendingComments() {
    return prisma.comment.findMany({
      where: { status: 'PENDING' },
      include: {
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
}

// Subscriber utilities
export const subscriberUtils = {
  async subscribe(email: string, name?: string) {
    const token = crypto.randomUUID()
    return prisma.subscriber.create({
      data: {
        email,
        name,
        token,
      },
    })
  },

  async confirmSubscription(token: string) {
    return prisma.subscriber.update({
      where: { token },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    })
  },

  async unsubscribe(token: string) {
    return prisma.subscriber.update({
      where: { token },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })
  },

  async getActiveSubscribers() {
    return prisma.subscriber.findMany({
      where: {
        status: 'CONFIRMED',
      },
    })
  },
}

// Settings utilities
export const settingsUtils = {
  async getSetting(key: string) {
    const setting = await prisma.settings.findUnique({
      where: { key },
    })
    return setting?.value
  },

  async getSettings(category?: string) {
    return prisma.settings.findMany({
      where: category ? { category } : undefined,
      orderBy: {
        key: 'asc',
      },
    })
  },

  async updateSetting(key: string, value: any) {
    return prisma.settings.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        type: typeof value === 'boolean' ? 'BOOLEAN' : 
              typeof value === 'number' ? 'NUMBER' : 
              typeof value === 'object' ? 'JSON' : 'STRING',
      },
    })
  },

  async getPublicSettings() {
    return prisma.settings.findMany({
      where: { isPublic: true },
    })
  },
}

// Category utilities
export const categoryUtils = {
  async getAllCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })
  },

  async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    })
  },
}

// Tag utilities
export const tagUtils = {
  async getPopularTags(limit = 10) {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })

    return tags
      .sort((a, b) => b._count.posts - a._count.posts)
      .slice(0, limit)
  },

  async getTagBySlug(slug: string) {
    return prisma.tag.findUnique({
      where: { slug },
    })
  },
}

// Image utilities
export const imageUtils = {
  async createImage(data: {
    url: string
    filename: string
    mimeType: string
    size: number
    width?: number
    height?: number
    alt?: string
    provider?: 'LOCAL' | 'S3' | 'CLOUDINARY'
    publicId?: string
    postId?: string
    uploadedBy?: string
  }) {
    return prisma.image.create({
      data,
    })
  },

  async getImagesByPost(postId: string) {
    return prisma.image.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async deleteImage(imageId: string) {
    return prisma.image.delete({
      where: { id: imageId },
    })
  },
}

// Analytics utilities
export const analyticsUtils = {
  async getPostAnalytics(days = 30) {
    const date = new Date()
    date.setDate(date.getDate() - days)
    
    return prisma.post.findMany({
      where: {
        publishedAt: {
          gte: date,
        },
      },
      select: {
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        views: 'desc',
      },
      take: 10,
    })
  },

  async getDashboardStats() {
    const [totalPosts, totalComments, totalSubscribers, totalViews] = await Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.subscriber.count({ where: { status: 'CONFIRMED' } }),
      prisma.post.aggregate({
        _sum: { views: true },
        where: { status: 'PUBLISHED' },
      }),
    ])

    return {
      totalPosts,
      totalComments,
      totalSubscribers,
      totalViews: totalViews._sum.views || 0,
    }
  },
}