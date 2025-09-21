import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, Eye, MapPin, User } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { 
  ArticleContent, 
  AuthorBio, 
  ShareButtons, 
  RelatedPosts, 
  CommentsSection 
} from '@/components/blog';
import { DetailedBlogPost } from '@/types/blog';
import ViewTracker from './ViewTracker';
import { siteConfig } from '@/config/site';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<DetailedBlogPost | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts/${slug}`, {
      // Enable ISR - revalidate every hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.post : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: `Post Not Found | ${siteConfig.name}`,
      description: 'The requested blog post could not be found.',
    };
  }

  const publishedDate = new Date(post.publishedAt);
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || siteConfig.url;
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read about ${post.title} on ${siteConfig.name}.`,
    keywords: post.metaKeywords || [post.title, 'travel', 'worldschooling', 'family travel'],
    authors: [{ name: post.author.name || siteConfig.team.defaultAuthor }],
    creator: post.author.name || siteConfig.team.defaultAuthor,
    alternates: {
      canonical: post.canonicalUrl || postUrl,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.metaDescription || `Read about ${post.title} on Wandering Minds.`,
      url: postUrl,
      siteName: siteConfig.name,
      publishedTime: publishedDate.toISOString(),
      authors: [post.author.name || siteConfig.team.defaultAuthor],
      images: post.featuredImage ? [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      tags: post.tags?.map(tag => tag.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.metaDescription || `Read about ${post.title} on Wandering Minds.`,
      creator: siteConfig.social.twitterHandle,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt);
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || siteConfig.url;
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author.name || siteConfig.team.defaultAuthor,
      ...(post.author.image ? { image: post.author.image } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: publishedDate.toISOString(),
    dateModified: publishedDate.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    keywords: post.tags?.map(tag => tag.name).join(', '),
    articleSection: post.category?.name,
    ...(post.location && {
      contentLocation: {
        '@type': 'Place',
        name: post.location,
        ...(post.coordinates && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: post.coordinates.lat,
            longitude: post.coordinates.lng,
          },
        }),
      },
    }),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* View Tracker */}
      <ViewTracker slug={post.slug} />

      <article className="py-8">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center gap-2 text-gray-600">
              <li><Link href="/" className="hover:text-teal-600">Home</Link></li>
              <li>/</li>
              <li><Link href="/blog" className="hover:text-teal-600">Blog</Link></li>
              {post.category && (
                <>
                  <li>/</li>
                  <li>
                    <Link 
                      href={`/blog?category=${post.category.slug}`}
                      className="hover:text-teal-600"
                    >
                      {post.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li>/</li>
              <li className="text-gray-900 truncate">{post.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            {/* Category Badge */}
            {post.category && (
              <div className="mb-4">
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="inline-flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-200 transition-colors"
                >
                  {post.category.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold font-playfair text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={publishedDate.toISOString()}>
                  {publishedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>

              {post.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
              )}

              {post.views && post.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              )}

              {post.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{post.location}{post.country && `, ${post.country}`}</span>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Share:</span>
              <ShareButtons
                url={postUrl}
                title={post.title}
                description={post.excerpt || undefined}
                variant="horizontal"
                showLabels={false}
              />
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-4xl mx-auto">
            <ArticleContent post={post} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/blog?tag=${tag.slug}`}
                      className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-12">
              <AuthorBio author={post.author} />
            </div>

            {/* Share Again */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Enjoyed this article? Share it with others!</p>
                <ShareButtons
                  url={postUrl}
                  title={post.title}
                  description={post.excerpt || undefined}
                  variant="horizontal"
                  showLabels={true}
                  className="justify-center"
                />
              </div>
            </div>
          </div>
        </Container>
      </article>

      {/* Related Posts */}
      <section className="py-12 bg-gray-50">
        <Container>
          <RelatedPosts currentPostSlug={post.slug} />
        </Container>
      </section>

      {/* Comments Section */}
      <section className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <CommentsSection
              postSlug={post.slug}
              initialComments={post.comments || []}
              totalComments={post.commentCount || 0}
            />
          </div>
        </Container>
      </section>
    </>
  );
}