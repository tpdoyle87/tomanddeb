import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CategoryHero, PostCard, FilterBar } from '@/components/blog';
import { Container, Pagination } from '@/components/ui';
import { CategoryWithStats, BlogPost } from '@/types/blog';
import { siteConfig } from '@/config/site';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sortBy?: 'recent' | 'popular' | 'oldest';
    tag?: string;
    search?: string;
  }>;
}

async function getCategoryData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.category as CategoryWithStats & {
      subcategories: CategoryWithStats[];
      parent: { id: string; name: string; slug: string } | null;
      metaTitle?: string;
      metaDescription?: string;
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

async function getCategoryPosts(
  slug: string,
  page: number = 1,
  sortBy: string = 'recent',
  tag?: string,
  search?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '12',
    sortBy,
    ...(tag && { tag }),
    ...(search && { search }),
  });

  try {
    const response = await fetch(`${baseUrl}/api/categories/${slug}/posts?${params}`, {
      next: { revalidate: 60 }, // Revalidate every minute for posts
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryData(resolvedParams.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  const title = category.metaTitle || `${category.name} | ${siteConfig.name}`;
  const description = category.metaDescription || category.description || `Explore our ${category.name} articles and stories.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(category.image && { images: [category.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(category.image && { images: [category.image] }),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const sortBy = resolvedSearchParams.sortBy || 'recent';
  const tag = resolvedSearchParams.tag;
  const search = resolvedSearchParams.search;

  // Fetch category data and posts in parallel
  const [category, postsData] = await Promise.all([
    getCategoryData(resolvedParams.slug),
    getCategoryPosts(resolvedParams.slug, page, sortBy, tag, search),
  ]);

  if (!category || !postsData) {
    notFound();
  }

  const { posts, pagination, filters } = postsData;

  return (
    <main className="min-h-screen">
      {/* Category Hero */}
      <CategoryHero category={category} />

      <Container className="py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-primary transition-colors">
                Home
              </a>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
              <a href="/categories" className="hover:text-primary transition-colors">
                Categories
              </a>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
              <span className="text-secondary font-medium">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <section className="mb-12">
            <h2 className="font-playfair text-2xl font-bold text-secondary mb-6">
              Explore {category.name} Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.subcategories.map((subcategory) => (
                <a
                  key={subcategory.id}
                  href={`/category/${subcategory.slug}`}
                  className="group p-6 bg-muted rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20"
                >
                  <h3 className="font-playfair text-lg font-semibold text-secondary group-hover:text-primary mb-2 transition-colors">
                    {subcategory.name}
                  </h3>
                  {subcategory.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {subcategory.description}
                    </p>
                  )}
                  <div className="text-sm text-primary font-medium">
                    {subcategory.postCount} {subcategory.postCount === 1 ? 'post' : 'posts'}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Filter and Sort */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <FilterBar
            tags={filters.tags}
            showActiveFilters={true}
          />
        </Suspense>

        {/* Posts Grid */}
        <section className="mt-8">
          {/* Results Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-secondary">
                {search || tag ? 'Filtered Results' : `Latest ${category.name} Posts`}
              </h2>
              <p className="text-muted-foreground mt-1">
                {search && `Showing results for "${search}" in `}
                {tag && `Posts tagged with "${filters.tags.find((t: any) => t.slug === tag)?.name || tag}" in `}
                {category.name} ({pagination.total} {pagination.total === 1 ? 'post' : 'posts'})
              </p>
            </div>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post: BlogPost) => (
                  <PostCard key={post.id} post={post} showCategory={false} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    baseUrl={`/category/${resolvedParams.slug}`}
                    searchParams={new URLSearchParams(Object.entries(resolvedSearchParams).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))}
                  />
                </div>
              )}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-playfair text-xl font-semibold text-secondary mb-2">
                No posts found
              </h3>
              <p className="text-muted-foreground mb-6">
                {search || tag
                  ? 'No posts match your current filters. Try adjusting your search criteria.'
                  : `We haven't published any ${category.name.toLowerCase()} posts yet. Check back soon!`}
              </p>
              {(search || tag) && (
                <a
                  href={`/category/${resolvedParams.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Clear filters
                </a>
              )}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}