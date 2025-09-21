import Link from 'next/link';
import { MapPin, BookOpen, Camera, Users, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PostCard } from '@/components/blog/PostCard';
import { FeaturedPost } from '@/components/blog/FeaturedPost';
import { CategoryCard } from '@/components/blog/CategoryCard';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import { InstagramFeed } from '@/components/social/InstagramFeed';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';
import prisma from '@/lib/prisma';
import { siteConfig } from '@/config/site';

const features = [
  {
    name: 'Travel Stories',
    description: 'Real experiences from our adventures around the world, including the good, the bad, and the unexpected.',
    icon: MapPin,
    href: '/category/travel',
  },
  {
    name: 'Worldschooling',
    description: 'Practical tips, curriculum ideas, and resources for educating children while traveling.',
    icon: BookOpen,
    href: '/category/worldschooling',
  },
  {
    name: 'Photography Gallery',
    description: 'Stunning travel photography from around the world, available in high resolution.',
    icon: Camera,
    href: '/photography',
  },
  {
    name: 'Community',
    description: 'Connect with other traveling families and share experiences, tips, and support.',
    icon: Users,
    href: '/community',
  },
];

export default async function Home() {
  // Fetch data directly from database
  let latestPosts: any[] = [];
  let featuredPost: any = null;
  let categories: any[] = [];

  try {
    // Get latest posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: {
          lte: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 6
    });

    latestPosts = posts.map(post => ({
      ...post,
      commentCount: post._count.comments
    }));

    // Get featured post (highest views)
    const featured = await prisma.post.findFirst({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: {
          lte: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: {
        views: 'desc'
      }
    });

    if (featured) {
      featuredPost = {
        ...featured,
        commentCount: featured._count.comments
      };
    }

    // Get categories with post counts
    const categoriesData = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
                publishedAt: {
                  lte: new Date()
                }
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      },
      take: 4
    });

    categories = categoriesData.map(cat => ({
      ...cat,
      postCount: cat._count.posts
    }));
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 to-blue-50 py-16 lg:py-24">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-teal-600">{siteConfig.name}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our family&apos;s journey around the world through travel, worldschooling, 
              and building financial freedom from anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/about" className="inline-flex items-center px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-lg">
                Our Story →
              </Link>
              <Link href="/category/travel" className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg">
                Explore Destinations
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
              What We Share
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our experiences, lessons learned, and practical advice for families 
              considering or already living the nomadic lifestyle.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.name} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{feature.description}</CardDescription>
                  <Link href={feature.href} className="text-teal-500 underline-offset-4 hover:underline">
                    Learn more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Post Section */}
      {featuredPost && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-teal-600" />
                <span className="text-sm font-medium text-teal-600 uppercase tracking-wider">Featured Story</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900">
                Don't Miss This Adventure
              </h2>
            </div>
            <FeaturedPost post={featuredPost} />
          </Container>
        </section>
      )}

      {/* Latest Posts Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
                Latest Adventures
              </h2>
              <p className="text-lg text-gray-600">
                Recent stories from our travels and worldschooling journey.
              </p>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center text-gray-700 hover:text-teal-600 transition-colors">
              View All Posts →
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No posts available yet. Check back soon for amazing travel stories!</p>
              <Link href="/about" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Learn More About Our Journey
              </Link>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/blog" className="inline-flex items-center text-gray-700 hover:text-teal-600 transition-colors">
              View All Posts →
            </Link>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 lg:py-24 bg-teal-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
                Explore by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Dive deeper into the topics that matter most to worldschooling families.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} variant="compact" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 lg:py-24 bg-white" id="newsletter">
        <Container>
          <div className="max-w-2xl mx-auto">
            <NewsletterForm 
              title="Join 10,000+ Worldschooling Families"
              description="Get exclusive travel tips, worldschooling resources, and stunning photography delivered to your inbox every week."
              source="homepage-main"
            />
          </div>
        </Container>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
              Follow Our Daily Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See behind-the-scenes moments, quick tips, and real-time updates from our travels.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <InstagramFeed 
              variant="grid" 
              maxPosts={6}
              username={siteConfig.social.instagramUsername}
            />
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <TestimonialsSection />
        </Container>
      </section>
    </div>
  );
}