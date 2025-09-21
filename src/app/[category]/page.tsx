import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BlogCard } from '@/components/blog/BlogCard';
import { Container } from '@/components/ui';
import { prisma } from '@/lib/prisma';

const validCategories = ['travel', 'worldschooling'];

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  
  if (!validCategories.includes(category)) {
    return {
      title: 'Not Found',
    };
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${categoryTitle} | Travel Blog`,
    description: `Explore our ${categoryTitle.toLowerCase()} articles and stories`,
  };
}

async function getCategoryPosts(category: string) {
  // Map category slugs to tag names
  const tagMapping: Record<string, string> = {
    'travel': 'Travel',
    'worldschooling': 'Worldschooling',
  };

  const tagName = tagMapping[category];
  if (!tagName) return [];

  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      tags: {
        some: {
          name: {
            equals: tagName,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return posts;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  
  if (!validCategories.includes(category)) {
    notFound();
  }

  const posts = await getCategoryPosts(category);
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  // Category descriptions
  const descriptions: Record<string, string> = {
    travel: 'Discover amazing destinations, travel tips, and adventures from around the world.',
    worldschooling: 'Learn about our educational journey, homeschooling resources, and learning through travel.',
  };

  return (
    <main className="min-h-screen bg-white">
      <Container className="py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-secondary mb-4">
            {categoryTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {descriptions[category]}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">
              No {categoryTitle.toLowerCase()} posts yet.
            </p>
            <p className="text-muted-foreground">
              Check back soon for new content!
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}