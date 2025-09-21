import { Metadata } from 'next';
import { CategoryGrid } from '@/components/blog';
import { Container } from '@/components/ui';
import { CategoryStatsResponse } from '@/types/blog';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Categories | ${siteConfig.name} - Explore Our Topics`,
  description: 'Browse our travel blog categories including Travel Adventures, Worldschooling Education, and Photography Gallery. Find stories and insights that inspire your journey.',
  openGraph: {
    title: `Categories | ${siteConfig.name} - Explore Our Topics`,
    description: 'Browse our travel blog categories including Travel Adventures, Worldschooling Education, and Photography Gallery. Find stories and insights that inspire your journey.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Categories | ${siteConfig.name} - Explore Our Topics`,
    description: 'Browse our travel blog categories including Travel Adventures, Worldschooling Education, and Photography Gallery. Find stories and insights that inspire your journey.',
  },
};

async function getCategoriesData(): Promise<CategoryStatsResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/categories/stats`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories data:', error);
    return null;
  }
}

export default async function CategoriesPage() {
  const data = await getCategoriesData();

  if (!data) {
    return (
      <main className="min-h-screen">
        <Container className="py-16">
          <div className="text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-secondary mb-4">
              Categories
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sorry, we couldn't load the categories at this time. Please try again later.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  const { categories, stats } = data;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 py-16 md:py-24">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-secondary mb-6">
              Explore Our Categories
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Discover stories spanning three exciting worlds: breathtaking travel adventures, 
              innovative worldschooling approaches, and stunning travel photography.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stats.totalPosts}
                </div>
                <div className="text-muted-foreground uppercase tracking-wide text-sm font-medium">
                  Total Posts
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stats.totalCategories}
                </div>
                <div className="text-muted-foreground uppercase tracking-wide text-sm font-medium">
                  Categories
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stats.mostPopularCategory?.postCount || 0}
                </div>
                <div className="text-muted-foreground uppercase tracking-wide text-sm font-medium">
                  Posts in {stats.mostPopularCategory?.name || 'Top Category'}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24">
        <Container>
          {categories.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-4">
                  Browse by Interest
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Each category represents a different aspect of our nomadic family lifestyle. 
                  Dive deep into the topics that interest you most.
                </p>
              </div>

              <CategoryGrid categories={categories} />
              
              {/* Featured Categories Description */}
              <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 mx-auto lg:mx-0">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-secondary mb-4">
                    Travel Adventures
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Follow our family's journey across continents. From hidden gems to famous landmarks, 
                    we share authentic travel experiences, cultural insights, and practical tips for 
                    families exploring the world.
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6 mx-auto lg:mx-0">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-secondary mb-4">
                    Worldschooling Wisdom
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Education without borders. Discover how we turn the world into our children's classroom, 
                    blending formal curriculum with real-world experiences to create engaged, curious learners.
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6 mx-auto lg:mx-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-secondary mb-4">
                    Investment Insights
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Building wealth while living life on your terms. Learn our strategies for financial 
                    independence, remote income generation, and smart investing that funds our nomadic lifestyle.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-muted-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="font-playfair text-xl font-semibold text-secondary mb-2">
                No categories available
              </h3>
              <p className="text-muted-foreground">
                We're working on organizing our content. Check back soon for exciting categories!
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Call to Action */}
      <section className="bg-muted py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-6">
              Start Your Own Adventure
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Inspired by our journey? Ready to make your own leap into travel, education innovation, 
              or financial independence? Let's connect and explore how we can help you get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Get in Touch
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Learn About Us
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}