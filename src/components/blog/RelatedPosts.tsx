'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PostCard } from './PostCard';
import { BlogPost, RelatedPostsResponse } from '@/types/blog';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface RelatedPostsProps {
  currentPostSlug: string;
  limit?: number;
  className?: string;
  title?: string;
  showViewAll?: boolean;
}

export function RelatedPosts({
  currentPostSlug,
  limit = 4,
  className = '',
  title = 'Related Posts',
  showViewAll = true,
}: RelatedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${currentPostSlug}/related?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }

        const data: { success: boolean } & RelatedPostsResponse = await response.json();
        
        if (!data.success) {
          throw new Error('Failed to fetch related posts');
        }

        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching related posts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load related posts');
      } finally {
        setLoading(false);
      }
    }

    if (currentPostSlug) {
      fetchRelatedPosts();
    }
  }, [currentPostSlug, limit]);

  // Don't render if no posts and not loading
  if (!loading && posts.length === 0 && !error) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-playfair text-gray-900">
          {title}
        </h2>
        {showViewAll && posts.length > 0 && (
          <Link href="/blog" className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors">
            View All Posts
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading related posts...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-2">Failed to load related posts</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="compact"
              showAuthor={true}
              showCategory={true}
              showStats={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No related posts found</p>
          <Link href="/blog" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500 h-10 px-4 py-2">
            Browse All Posts
          </Link>
        </div>
      )}
    </section>
  );
}

// Alternative component for when you already have the posts data
interface StaticRelatedPostsProps {
  posts: BlogPost[];
  title?: string;
  className?: string;
  showViewAll?: boolean;
}

export function StaticRelatedPosts({
  posts,
  title = 'Related Posts',
  className = '',
  showViewAll = true,
}: StaticRelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-playfair text-gray-900">
          {title}
        </h2>
        {showViewAll && (
          <Link href="/blog" className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors">
            View All Posts
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant="compact"
            showAuthor={true}
            showCategory={true}
            showStats={true}
          />
        ))}
      </div>
    </section>
  );
}