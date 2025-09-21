import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Clock, DollarSign, Users, Thermometer, Camera, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

// Destination data (would typically come from a database)
const destinations: Record<string, any> = {
  thailand: {
    id: 'thailand',
    name: 'Thailand',
    tagline: 'Land of Smiles',
    description: 'Thailand offers an incredible mix of bustling cities, ancient temples, tropical beaches, and delicious cuisine. From the vibrant streets of Bangkok to the serene islands of the south, Thailand is a perfect destination for family travel.',
    heroImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920',
    quickFacts: {
      capital: 'Bangkok',
      currency: 'Thai Baht (THB)',
      language: 'Thai',
      bestTime: 'November to February',
      climate: 'Tropical',
      familyFriendly: '5/5',
    },
    highlights: [
      {
        name: 'Bangkok',
        description: 'Vibrant capital with temples, markets, and street food',
        image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600',
      },
      {
        name: 'Chiang Mai',
        description: 'Cultural hub with elephant sanctuaries and mountain temples',
        image: 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?w=600',
      },
      {
        name: 'Ko Phi Phi',
        description: 'Stunning islands with crystal clear waters',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
      },
      {
        name: 'Phuket',
        description: 'Beach paradise with family resorts and activities',
        image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600',
      },
    ],
    activities: [
      'Temple hopping in Bangkok',
      'Elephant sanctuary visits',
      'Island hopping tours',
      'Thai cooking classes',
      'Night market exploration',
      'Beach activities and snorkeling',
      'Tuk-tuk adventures',
      'Traditional Thai massage',
    ],
    travelTips: [
      'Respect temple dress codes - cover shoulders and knees',
      'Stay hydrated in the tropical heat',
      'Try street food but choose busy stalls',
      'Bargain respectfully at markets',
      'Learn basic Thai phrases - locals appreciate it',
      'Book island ferries in advance during peak season',
    ],
    budget: {
      accommodation: '$20-100/night',
      meals: '$3-15/meal',
      transport: '$5-30/day',
      activities: '$10-50/activity',
    },
  },
  vietnam: {
    id: 'vietnam',
    name: 'Vietnam',
    tagline: 'Timeless Charm',
    description: 'Vietnam captivates with its rich history, stunning landscapes, and incredible cuisine. From the limestone karsts of Ha Long Bay to the bustling streets of Hanoi, Vietnam offers endless adventures for families.',
    heroImage: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1920',
    quickFacts: {
      capital: 'Hanoi',
      currency: 'Vietnamese Dong (VND)',
      language: 'Vietnamese',
      bestTime: 'March to May, September to November',
      climate: 'Tropical/Subtropical',
      familyFriendly: '4/5',
    },
    highlights: [
      {
        name: 'Ha Long Bay',
        description: 'UNESCO site with thousands of limestone islands',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600',
      },
      {
        name: 'Hanoi',
        description: 'Historic capital with French colonial architecture',
        image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600',
      },
      {
        name: 'Hoi An',
        description: 'Charming ancient town with lantern festivals',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
      },
      {
        name: 'Mekong Delta',
        description: 'River life and floating markets',
        image: 'https://images.unsplash.com/photo-1557750255-8b2642b6d3dd?w=600',
      },
    ],
    activities: [
      'Cruise Ha Long Bay',
      'Explore Cu Chi Tunnels',
      'Bike through rice paddies',
      'Lantern making in Hoi An',
      'Water puppet shows',
      'Vietnamese cooking classes',
      'Beach time in Da Nang',
      'Mekong Delta boat tours',
    ],
    travelTips: [
      'Cross streets confidently but carefully',
      'Carry toilet paper and hand sanitizer',
      'Download Grab for easy transportation',
      'Try pho for breakfast like locals',
      'Negotiate taxi fares before riding',
      'Respect war memorials and museums',
    ],
    budget: {
      accommodation: '$15-80/night',
      meals: '$2-10/meal',
      transport: '$5-25/day',
      activities: '$10-40/activity',
    },
  },
  // Add more destinations as needed
};

type Props = {
  params: Promise<{
    destination: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination: destinationId } = await params;
  const destination = destinations[destinationId];

  if (!destination) {
    return {
      title: 'Destination Not Found',
    };
  }

  return {
    title: `${destination.name} Travel Guide - Tom and Deb Adventures`,
    description: `Explore ${destination.name}: ${destination.tagline}. Find travel tips, highlights, activities, and family-friendly advice for visiting ${destination.name}.`,
  };
}

async function getDestinationPosts(destinationName: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        OR: [
          {
            tags: {
              some: {
                name: {
                  equals: destinationName,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            title: {
              contains: destinationName,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readingTime: true,
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching destination posts:', error);
    return [];
  }
}

async function getDestinationPhotos(destinationName: string) {
  try {
    const photos = await prisma.photo.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          {
            location: {
              contains: destinationName,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              has: destinationName,
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        location: true,
      },
    });
    return photos;
  } catch (error) {
    console.error('Error fetching destination photos:', error);
    return [];
  }
}

export default async function DestinationPage({ params }: Props) {
  const { destination: destinationId } = await params;
  const destination = destinations[destinationId];

  if (!destination) {
    notFound();
  }

  const [posts, photos] = await Promise.all([
    getDestinationPosts(destination.name),
    getDestinationPhotos(destination.name),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="relative h-full flex items-end pb-12">
          <Container>
            <Link href="/travel" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Travel
            </Link>
            <h1 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-2">
              {destination.name}
            </h1>
            <p className="text-2xl text-white/90 mb-4">{destination.tagline}</p>
            <p className="text-lg text-white/80 max-w-3xl">
              {destination.description}
            </p>
          </Container>
        </div>
      </section>

      <Container className="py-12">
        {/* Quick Facts */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Quick Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Capital</p>
                  <p className="font-semibold">{destination.quickFacts.capital}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Currency</p>
                  <p className="font-semibold">{destination.quickFacts.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Language</p>
                  <p className="font-semibold">{destination.quickFacts.language}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Best Time</p>
                  <p className="font-semibold">{destination.quickFacts.bestTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Climate</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    {destination.quickFacts.climate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Family Friendly</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {destination.quickFacts.familyFriendly}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-playfair font-bold mb-8">Must-Visit Places</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destination.highlights.map((highlight: any) => (
              <Card key={highlight.name} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 h-48">
                    <Image
                      src={highlight.image}
                      alt={highlight.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      {highlight.name}
                    </h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Activities & Travel Tips */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Things to Do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {destination.activities.map((activity: string) => (
                    <li key={activity} className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Travel Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {destination.travelTips.map((tip: string) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Budget Guide */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Budget Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Accommodation</p>
                  <p className="font-semibold">{destination.budget.accommodation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Meals</p>
                  <p className="font-semibold">{destination.budget.meals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transport</p>
                  <p className="font-semibold">{destination.budget.transport}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Activities</p>
                  <p className="font-semibold">{destination.budget.activities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Related Posts */}
        {posts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-playfair font-bold mb-8">
              Our {destination.name} Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt!.toString())}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime || '5'} min read
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-playfair font-bold mb-8 flex items-center gap-3">
              <Camera className="h-8 w-8 text-teal-600" />
              Photos from {destination.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Link key={photo.id} href={`/photography/${photo.slug}`}>
                  <div className="relative aspect-square overflow-hidden rounded-lg group">
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 text-white">
                        <p className="text-sm font-semibold">{photo.title}</p>
                        {photo.location && (
                          <p className="text-xs opacity-90">{photo.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}