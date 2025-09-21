'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Eye, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface FeaturedPostProps {
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
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const postUrl = `/blog/${post.slug}`;
  const publishedDate = new Date(post.publishedAt);

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-teal-50 to-blue-50 border-0 shadow-xl">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-[4/3] lg:aspect-auto">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {post.category?.name || 'Featured Post'}
                </span>
              </div>
            )}
            
            {/* Category Badge */}
            {post.category && (
              <div className="absolute top-6 left-6">
                <Link
                  href={`/category/${post.category.slug}`}
                  className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors shadow-lg"
                >
                  {post.category.name}
                </Link>
              </div>
            )}

            {/* Location Badge */}
            {post.location && (
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{post.location}</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {/* Featured Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-teal-600 uppercase tracking-wider">
                Featured Story
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-playfair font-bold text-gray-900 mb-4 leading-tight">
              <Link 
                href={postUrl}
                className="hover:text-teal-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={publishedDate.toISOString()}>
                  {publishedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
              
              {post.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
              )}
              
              {typeof post.views === 'number' && post.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              )}
              
              {typeof post.commentCount === 'number' && post.commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentCount} comments</span>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 mb-8">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-semibold text-lg">
                    {post.author.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={postUrl}
                className="inline-flex items-center justify-center h-11 px-8 text-lg bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Read Full Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.slice(0, 4).map(tag => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="text-sm text-teal-600 bg-teal-100 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
                {post.tags.length > 4 && (
                  <span className="text-sm text-gray-400 px-3 py-1">
                    +{post.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}