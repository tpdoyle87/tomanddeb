import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@travelblog.com' },
    update: {},
    create: {
      email: 'admin@travelblog.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Site administrator and content manager',
      emailVerified: new Date(),
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: {
        slug: 'travel',
        name: 'Travel',
        description: 'Travel guides, tips, and destination reviews',
        order: 1,
        metaTitle: 'Travel Guides and Tips',
        metaDescription: 'Explore our comprehensive travel guides, tips, and destination reviews from around the world',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'worldschooling' },
      update: {},
      create: {
        slug: 'worldschooling',
        name: 'Worldschooling',
        description: 'Education on the road - tips for teaching and learning while traveling',
        order: 2,
        metaTitle: 'Worldschooling Resources',
        metaDescription: 'Resources and tips for worldschooling families - education while traveling',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'investment' },
      update: {},
      create: {
        slug: 'investment',
        name: 'Investment',
        description: 'Financial independence, investment strategies, and money management for travelers',
        order: 3,
        metaTitle: 'Travel Investment Strategies',
        metaDescription: 'Learn about investment strategies and financial independence for long-term travelers',
      },
    }),
  ])

  console.log('Created categories:', categories.map(c => c.name).join(', '))

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'budget-travel' },
      update: {},
      create: {
        slug: 'budget-travel',
        name: 'Budget Travel',
        description: 'Tips and tricks for traveling on a budget',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'family-travel' },
      update: {},
      create: {
        slug: 'family-travel',
        name: 'Family Travel',
        description: 'Travel tips for families with children',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'digital-nomad' },
      update: {},
      create: {
        slug: 'digital-nomad',
        name: 'Digital Nomad',
        description: 'Remote work and travel lifestyle',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'homeschooling' },
      update: {},
      create: {
        slug: 'homeschooling',
        name: 'Homeschooling',
        description: 'Educational resources for homeschooling families',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'real-estate' },
      update: {},
      create: {
        slug: 'real-estate',
        name: 'Real Estate',
        description: 'Real estate investment for travelers',
      },
    }),
  ])

  console.log('Created tags:', tags.map(t => t.name).join(', '))

  // Create site settings
  const settings = [
    {
      key: 'site_title',
      value: JSON.stringify('Travel & Worldschooling Blog'),
      type: 'STRING' as const,
      category: 'general',
      description: 'The main title of the website',
      isPublic: true,
    },
    {
      key: 'site_description',
      value: JSON.stringify('A blog about travel, worldschooling, and financial independence'),
      type: 'STRING' as const,
      category: 'general',
      description: 'The main description of the website',
      isPublic: true,
    },
    {
      key: 'posts_per_page',
      value: JSON.stringify(10),
      type: 'NUMBER' as const,
      category: 'display',
      description: 'Number of posts to display per page',
      isPublic: false,
    },
    {
      key: 'enable_comments',
      value: JSON.stringify(true),
      type: 'BOOLEAN' as const,
      category: 'features',
      description: 'Enable or disable comments on posts',
      isPublic: false,
    },
    {
      key: 'social_media',
      value: JSON.stringify({
        twitter: '',
        facebook: '',
        instagram: '',
        youtube: '',
        linkedin: '',
      }),
      type: 'JSON' as const,
      category: 'social',
      description: 'Social media profile URLs',
      isPublic: true,
    },
  ]

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('Created site settings')

  // Create sample post
  const samplePost = await prisma.post.create({
    data: {
      slug: 'welcome-to-our-travel-blog',
      title: 'Welcome to Our Travel & Worldschooling Blog',
      excerpt: 'Join us on our journey as we explore the world, educate our children on the road, and build financial independence.',
      content: `
# Welcome to Our Travel & Worldschooling Blog

We're thrilled to have you here! This blog is our digital home where we share our adventures, lessons learned, and tips for families who dream of combining travel with education and financial freedom.

## What You'll Find Here

### Travel Guides
Detailed guides to destinations we've visited, including:
- Budget breakdowns
- Family-friendly activities
- Hidden gems and local favorites
- Practical tips for traveling with children

### Worldschooling Resources
Our approach to education on the road:
- Curriculum ideas and resources
- Real-world learning opportunities
- Technology tools for remote learning
- Connecting with local communities

### Investment Strategies
Building wealth while traveling:
- Remote work opportunities
- Investment portfolio management
- Real estate investing from abroad
- Creating passive income streams

## Our Story

We're a family of four who decided to leave the traditional path behind and explore the world together. What started as a one-year adventure has become our lifestyle, and we've learned so much along the way.

## Join Our Community

Subscribe to our newsletter to receive:
- Weekly travel tips and destination guides
- Worldschooling resources and curriculum ideas
- Investment insights for location-independent families
- Exclusive content and behind-the-scenes updates

We're excited to share this journey with you!
      `,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: categories[0].id,
      metaTitle: 'Welcome to Our Travel & Worldschooling Blog',
      metaDescription: 'Join our family as we travel the world, homeschool our children, and build financial independence through smart investments.',
      metaKeywords: ['travel blog', 'worldschooling', 'family travel', 'digital nomad', 'investment'],
      readTime: 3,
      views: 0,
      tags: {
        connect: [
          { id: tags[0].id },
          { id: tags[1].id },
        ],
      },
    },
  })

  console.log('Created sample post:', samplePost.title)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })