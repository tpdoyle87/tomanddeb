'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MessageCircle, MapPin, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    publishedAt: Date | string;
    readTime?: number | null;
    views?: number;
    location?: string | null;
    country?: string | null;
    author: {
      name: string | null;
      image?: string | null;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    tags?: Array<{
      name: string;
      slug: string;
    }>;
    commentCount?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  showAuthor?: boolean;
  showCategory?: boolean;
  showStats?: boolean;
}

export function PostCard({ 
  post, 
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showStats = true,
}: PostCardProps) {
  const postUrl = `/blog/${post.slug}`;
  const publishedDate = new Date(post.publishedAt);
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${
      isFeatured ? 'lg:col-span-2' : ''
    }`}>
      {/* Featured Image */}
      <div className={`relative bg-gray-200 ${
        isCompact ? 'aspect-[4/3]' : isFeatured ? 'aspect-[2/1]' : 'aspect-video'
      }`}>
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {post.category?.name || 'Travel'}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        {showCategory && post.category && (
          <div className="absolute top-4 left-4">
            <Link
              href={`/category/${post.category.slug}`}
              className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-teal-700 transition-colors"
            >
              {post.category.name}
            </Link>
          </div>
        )}

        {/* Location Badge */}
        {post.location && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{post.location}</span>
          </div>
        )}
      </div>

      <CardHeader className={isCompact ? 'pb-3' : ''}>
        {/* Post Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <time dateTime={publishedDate.toISOString()}>
            {publishedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          {showStats && post.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>

        {/* Title */}
        <CardTitle className={`line-clamp-2 group-hover:text-teal-600 transition-colors ${
          isFeatured ? 'text-xl lg:text-2xl' : isCompact ? 'text-lg' : 'text-lg'
        }`}>
          <Link href={postUrl}>
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className={isCompact ? 'pt-0' : ''}>
        {/* Excerpt */}
        {post.excerpt && !isCompact && (
          <CardDescription className="line-clamp-3 mb-4">
            {post.excerpt}
          </CardDescription>
        )}

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Author */}
            {showAuthor && (
              <div className="flex items-center gap-2">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || 'Author'}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 text-xs font-medium">
                      {post.author.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-600">{post.author.name}</span>
              </div>
            )}
          </div>

          {/* Post Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {typeof post.views === 'number' && post.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.views}</span>
                </div>
              )}
              {typeof post.commentCount === 'number' && post.commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{post.commentCount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Read More Button */}
        {!isCompact && (
          <div className="mt-4">
            <Link href={postUrl} className="inline-flex items-center text-teal-600 hover:underline">
              Read more
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && !isCompact && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.slice(0, 3).map(tag => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full hover:bg-teal-100 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}