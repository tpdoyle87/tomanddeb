import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Users, Globe, GraduationCap, Lightbulb, Heart, Calendar, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Worldschooling - Tom and Deb Adventures',
  description: 'Our worldschooling journey: education through travel, cultural immersion, and real-world experiences for our children.',
};

// Worldschooling subjects/topics
const learningTopics = [
  {
    id: 'geography',
    title: 'Geography & Culture',
    icon: Globe,
    description: 'Learning about different countries, cultures, and traditions through immersive experiences.',
    color: 'bg-blue-100 text-blue-600',
    examples: ['Map reading', 'Cultural traditions', 'Languages', 'World religions'],
  },
  {
    id: 'history',
    title: 'History & Heritage',
    icon: BookOpen,
    description: 'Exploring historical sites and understanding the past through direct experience.',
    color: 'bg-purple-100 text-purple-600',
    examples: ['Ancient civilizations', 'World War history', 'Art history', 'Archaeological sites'],
  },
  {
    id: 'science',
    title: 'Science & Nature',
    icon: Lightbulb,
    description: 'Discovering science through nature, wildlife, and environmental studies.',
    color: 'bg-green-100 text-green-600',
    examples: ['Marine biology', 'Ecosystems', 'Geology', 'Wildlife conservation'],
  },
  {
    id: 'life-skills',
    title: 'Life Skills',
    icon: Heart,
    description: 'Building practical skills and independence through travel experiences.',
    color: 'bg-red-100 text-red-600',
    examples: ['Budgeting', 'Navigation', 'Problem-solving', 'Communication'],
  },
];

// Sample curriculum resources
const resources = [
  {
    title: 'Math on the Move',
    description: 'Practical math lessons using real-world travel scenarios',
    type: 'Curriculum',
    age: '8-12 years',
  },
  {
    title: 'World Literature Journey',
    description: 'Reading lists organized by countries and cultures',
    type: 'Reading List',
    age: 'All ages',
  },
  {
    title: 'Science Explorations',
    description: 'Hands-on science activities for different destinations',
    type: 'Activities',
    age: '6-14 years',
  },
  {
    title: 'Language Learning Resources',
    description: 'Tools and apps for learning languages on the go',
    type: 'Languages',
    age: 'All ages',
  },
];

async function getWorldschoolingPosts() {
  try {
    const posts = await prisma.post.findMany({
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
    console.error('Error fetching worldschooling posts:', error);
    return [];
  }
}

async function getWorldschoolingStats() {
  try {
    const [totalPosts, countries] = await Promise.all([
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
      // Simplified count - would need more complex query for actual countries
      Promise.resolve(8),
    ]);

    return {
      totalPosts,
      countries,
      yearsOnRoad: 3,
      kidsAges: '8 & 11',
    };
  } catch (error) {
    console.error('Error fetching worldschooling stats:', error);
    return {
      totalPosts: 0,
      countries: 0,
      yearsOnRoad: 0,
      kidsAges: '',
    };
  }
}

export default async function WorldschoolingPage() {
  const [posts, stats] = await Promise.all([
    getWorldschoolingPosts(),
    getWorldschoolingStats(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920"
          alt="Worldschooling Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-4">
              Worldschooling Adventures
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Education without boundaries - learning through travel and cultural immersion
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span>{stats.yearsOnRoad} Years on the Road</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>{stats.countries} Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Kids Ages: {stats.kidsAges}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Container className="py-12">
        {/* Our Worldschooling Philosophy */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-playfair font-bold mb-6 text-center">
                Our Worldschooling Philosophy
              </h2>
              <div className="prose prose-lg mx-auto text-gray-700">
                <p className="mb-4">
                  We believe that the world is the best classroom. Through travel, our children learn not just from books,
                  but from real experiences, diverse cultures, and meaningful connections with people from all walks of life.
                </p>
                <p className="mb-4">
                  Our approach combines structured learning with spontaneous discovery, allowing our kids to develop
                  a deep understanding of the world while fostering curiosity, empathy, and independence.
                </p>
                <p>
                  Every destination becomes a learning opportunity - from math lessons in local markets to history
                  lessons at ancient sites, and science discoveries in nature's laboratories.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Learning Topics */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-playfair font-bold mb-4">What We Learn on the Road</h2>
            <p className="text-gray-600">Exploring different subjects through hands-on experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${topic.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                        <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topic.examples.map((example) => (
                        <span
                          key={example}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent Worldschooling Posts */}
        {posts.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-playfair font-bold mb-4">Recent Worldschooling Stories</h2>
              <p className="text-gray-600">Lessons learned and experiences from our educational journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
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
              <Link href="/blog?tag=worldschooling">
                <Button size="lg">
                  View All Worldschooling Posts
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Resources Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-playfair font-bold mb-4">Worldschooling Resources</h2>
            <p className="text-gray-600">Curated resources to help you on your worldschooling journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card key={resource.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">{resource.title}</h3>
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{resource.description}</p>
                <p className="text-sm text-gray-500">Age: {resource.age}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/worldschooling/resources">
              <Button variant="outline" size="lg">
                View All Resources
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <Card className="p-8">
            <h2 className="text-3xl font-playfair font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How do you handle curriculum while traveling?</h3>
                <p className="text-gray-600">
                  We use a combination of online resources, physical workbooks, and location-based learning.
                  Each destination offers unique educational opportunities that we incorporate into our lessons.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What about socialization?</h3>
                <p className="text-gray-600">
                  Our kids meet children from all over the world! We connect with other traveling families,
                  join local activities, and participate in community events wherever we go.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How do you track progress?</h3>
                <p className="text-gray-600">
                  We maintain portfolios of their work, use online assessment tools, and regularly review
                  their progress against educational standards to ensure they're meeting learning goals.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is worldschooling legal?</h3>
                <p className="text-gray-600">
                  Laws vary by country and state. We maintain legal compliance with our home state's
                  homeschooling requirements and research local regulations when staying long-term in any location.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="p-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <h2 className="text-3xl font-playfair font-bold mb-4">
              Start Your Worldschooling Journey
            </h2>
            <p className="text-xl mb-6 opacity-95">
              Get inspiration, resources, and practical tips for educating your children through travel
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/worldschooling/getting-started">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white hover:text-indigo-600">
                  Getting Started Guide
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </Container>
    </div>
  );
}