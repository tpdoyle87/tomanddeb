import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Clock, ArrowRight, Globe, Compass } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Travel - Tom and Deb Adventures',
  description: 'Explore our travel stories, destinations, and adventures from around the world.',
};

// Travel destinations will be added as we visit them
const destinations: any[] = [];

async function getRecentTravelPosts() {
  try {
    const posts = await prisma.post.findMany({
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
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: true,
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching travel posts:', error);
    return [];
  }
}

async function getTravelStats() {
  try {
    const [totalPosts, countries, photos] = await Promise.all([
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
      // Count unique country tags
      6, // Placeholder - would need more complex query
      prisma.photo.count({
        where: {
          status: 'PUBLISHED',
          category: 'Travel',
        },
      }),
    ]);

    return {
      totalPosts,
      countries,
      photos,
    };
  } catch (error) {
    console.error('Error fetching travel stats:', error);
    return {
      totalPosts: 0,
      countries: 0,
      photos: 0,
    };
  }
}

export default async function TravelPage() {
  const [recentPosts, stats] = await Promise.all([
    getRecentTravelPosts(),
    getTravelStats(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920"
          alt="Travel Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-4">
              Our Travel Adventures
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Exploring the world, one destination at a time
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>{stats.countries} Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{destinations.length} Destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                <span>{stats.totalPosts} Stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Container className="py-12">
        {/* Featured Destinations */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-playfair font-bold mb-4">Featured Destinations</h2>
            <p className="text-gray-600">
              {destinations.length > 0
                ? "Click on a destination to explore our adventures there"
                : "Our travel destinations will appear here as we explore the world"}
            </p>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/travel/${destination.id}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">Last visit: {destination.lastVisit}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-600 mb-3">{destination.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {destination.highlights.slice(0, 3).map((highlight) => (
                        <span
                          key={highlight}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                      {destination.highlights.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          +{destination.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {destination.posts} stories
                      </span>
                      <ArrowRight className="h-4 w-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          ) : (
            <Card className="p-12 text-center bg-gray-50">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Destinations Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're just getting started on our travel journey. Check back soon for exciting destinations and travel stories!
              </p>
            </Card>
          )}
        </section>

        {/* Recent Travel Posts */}
        {recentPosts.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-playfair font-bold mb-4">Recent Travel Stories</h2>
              <p className="text-gray-600">Our latest adventures and travel tips</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    {post.featuredImage && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt!.toString())}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime || '5'} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/blog?tag=travel">
                <Button size="lg">
                  View All Travel Posts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Travel Resources */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-playfair font-bold mb-4">Travel Resources</h2>
              <p className="text-gray-600 mb-8">
                Planning your next adventure? Check out our travel guides, tips, and resources
                to help make your journey unforgettable.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/travel/planning">
                  <Button variant="outline" className="w-full">
                    Travel Planning Guide
                  </Button>
                </Link>
                <Link href="/travel/packing">
                  <Button variant="outline" className="w-full">
                    Packing Lists
                  </Button>
                </Link>
                <Link href="/travel/tips">
                  <Button variant="outline" className="w-full">
                    Travel Tips
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* Newsletter CTA */}
        <section className="text-center">
          <Card className="p-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <h2 className="text-3xl font-playfair font-bold mb-4">
              Never Miss an Adventure
            </h2>
            <p className="text-xl mb-6 opacity-95">
              Subscribe to our newsletter for travel tips, destination guides, and stories from the road
            </p>
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Subscribe Now
              </Button>
            </Link>
          </Card>
        </section>
      </Container>
    </div>
  );
}