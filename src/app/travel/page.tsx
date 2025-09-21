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

// Travel destination data (can be moved to database later)
const destinations = [
  {
    id: 'thailand',
    name: 'Thailand',
    description: 'Land of smiles, temples, and tropical beaches',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
    posts: 12,
    lastVisit: '2024',
    highlights: ['Bangkok', 'Chiang Mai', 'Ko Phi Phi', 'Phuket'],
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    description: 'Rich history, stunning landscapes, and delicious cuisine',
    image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800',
    posts: 8,
    lastVisit: '2024',
    highlights: ['Ha Long Bay', 'Hanoi', 'Ho Chi Minh City', 'Hoi An'],
  },
  {
    id: 'japan',
    name: 'Japan',
    description: 'Where ancient traditions meet modern innovation',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    posts: 15,
    lastVisit: '2023',
    highlights: ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji'],
  },
  {
    id: 'italy',
    name: 'Italy',
    description: 'Art, history, and the best food in the world',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    posts: 10,
    lastVisit: '2023',
    highlights: ['Rome', 'Venice', 'Florence', 'Amalfi Coast'],
  },
  {
    id: 'greece',
    name: 'Greece',
    description: 'Ancient ruins, crystal waters, and island paradise',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
    posts: 6,
    lastVisit: '2023',
    highlights: ['Athens', 'Santorini', 'Mykonos', 'Crete'],
  },
  {
    id: 'peru',
    name: 'Peru',
    description: 'Inca heritage, Amazon rainforest, and mountain adventures',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
    posts: 7,
    lastVisit: '2022',
    highlights: ['Machu Picchu', 'Cusco', 'Lima', 'Amazon'],
  },
];

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
            <p className="text-gray-600">Click on a destination to explore our adventures there</p>
          </div>
          
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