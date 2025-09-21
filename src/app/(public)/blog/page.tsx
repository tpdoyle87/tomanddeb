import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Pagination } from '@/components/ui/Pagination';
import { PostCard, SearchBar, FilterBar } from '@/components/blog';
import { BlogSearchResponse } from '@/types/blog';
import { BookOpen, Search as SearchIcon } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function searchPosts(params: Record<string, string>): Promise<BlogSearchResponse> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    if (params.query) searchParams.set('query', params.query);
    if (params.category) searchParams.set('category', params.category);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.author) searchParams.set('author', params.author);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    
    // Request filter data for first page load
    searchParams.set('includeFilters', 'true');

    const response = await fetch(`${baseUrl}/api/posts/search?${searchParams.toString()}`, {
      // Enable ISR with shorter revalidation for dynamic content
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    return data.success ? data : {
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
    };
  }
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.query;
  const category = params.category;
  const tag = params.tag;
  
  let title = `Blog | ${siteConfig.name}`;
  let description = 'Explore our travel stories, worldschooling adventures, and family journey around the world.';

  if (query) {
    title = `Search results for "${query}" | ${siteConfig.name} Blog`;
    description = `Find articles about "${query}" on our travel and worldschooling blog.`;
  } else if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} | ${siteConfig.name} Blog`;
    description = `Read our latest articles about ${category} and discover amazing travel experiences.`;
  } else if (tag) {
    title = `${tag.charAt(0).toUpperCase() + tag.slice(1)} Posts | ${siteConfig.name} Blog`;
    description = `Browse articles tagged with ${tag} on our travel and worldschooling blog.`;
  }

  return {
    title,
    description,
    keywords: ['travel blog', 'worldschooling', 'family travel', 'nomad life', 'travel stories'],
    alternates: {
      canonical: '/blog',
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${siteConfig.url}/blog`,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: siteConfig.social.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '12');
  
  // Fetch posts and filters
  const searchResults = await searchPosts({
    query: params.query || '',
    category: params.category || '',
    tag: params.tag || '',
    author: params.author || '',
    sortBy: params.sortBy || 'recent',
    page: currentPage.toString(),
    limit: limit.toString(),
  });

  const hasActiveFilters = !!(
    params.query || 
    params.category || 
    params.tag || 
    params.author
  );

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} Blog`,
    description: 'Travel stories, worldschooling adventures, and family journey around the world.',
    url: `${siteConfig.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    blogPost: searchResults.posts.slice(0, 5).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage,
      datePublished: new Date(post.publishedAt).toISOString(),
      author: {
        '@type': 'Person',
        name: post.author.name || siteConfig.team.defaultAuthor,
      },
      url: `${siteConfig.url}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-8">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-teal-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold font-playfair text-gray-900 mb-4">
              {hasActiveFilters ? 'Search Results' : 'Our Travel Blog'}
            </h1>
            {!hasActiveFilters ? (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Follow our journey around the world through stories of adventure, 
                discovery, and the lessons we learn along the way.
              </p>
            ) : (
              <p className="text-lg text-gray-600">
                {searchResults.total > 0 
                  ? `Found ${searchResults.total} result${searchResults.total === 1 ? '' : 's'}`
                  : 'No articles found matching your criteria'
                }
              </p>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar 
              placeholder="Search articles, destinations, topics..."
              className="w-full"
            />
          </div>

          {/* Filters */}
          {searchResults.filters && (
            <div className="mb-8">
              <FilterBar
                categories={searchResults.filters.categories}
                tags={searchResults.filters.tags}
                authors={searchResults.filters.authors}
                showActiveFilters={true}
              />
            </div>
          )}

          {/* Content */}
          {searchResults.posts.length > 0 ? (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, searchResults.total)} of {searchResults.total} articles
                </p>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {searchResults.posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    variant={index === 0 && currentPage === 1 ? 'featured' : 'default'}
                    showAuthor={true}
                    showCategory={true}
                    showStats={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={searchResults.totalPages}
                  totalItems={searchResults.total}
                  itemsPerPage={limit}
                  baseUrl="/blog"
                  searchParams={new URLSearchParams(params as Record<string, string>)}
                />
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              
              {hasActiveFilters ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No articles found
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <SearchBar 
                        placeholder="Try different keywords..."
                        className="max-w-md mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      or{' '}
                      <a 
                        href="/blog" 
                        className="text-teal-600 hover:text-teal-700 underline"
                      >
                        view all articles
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No articles published yet
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We're working on creating amazing content for you. 
                    Check back soon for our latest travel stories!
                  </p>
                </>
              )}
            </div>
          )}
        </Container>
      </div>
    </>
  );
}