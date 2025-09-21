'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    postCount: number;
  };
  variant?: 'default' | 'compact' | 'featured';
}

export function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
  const categoryUrl = `/category/${category.slug}`;
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  // Generate a gradient color based on category name for placeholder
  const getGradientColor = (name: string) => {
    const colors = [
      'from-teal-400 to-blue-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-green-400 to-blue-500',
      'from-indigo-400 to-purple-500',
      'from-yellow-400 to-orange-500',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${
      isFeatured ? 'lg:col-span-2' : ''
    }`}>
      {/* Category Image/Visual */}
      <div className={`relative bg-gray-200 ${
        isCompact ? 'aspect-[4/3]' : 'aspect-video'
      }`}>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor(category.name)} flex items-center justify-center`}>
            <div className="text-center text-white">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <span className="font-medium text-lg">{category.name}</span>
            </div>
          </div>
        )}
        
        {/* Post Count Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
        </div>
      </div>

      <CardHeader className={isCompact ? 'pb-3' : ''}>
        {/* Category Name */}
        <CardTitle className={`group-hover:text-teal-600 transition-colors ${
          isFeatured ? 'text-xl' : 'text-lg'
        }`}>
          <Link href={categoryUrl}>
            {category.name}
          </Link>
        </CardTitle>

        {/* Description */}
        {category.description && !isCompact && (
          <CardDescription className="line-clamp-3">
            {category.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={isCompact ? 'pt-0' : ''}>
        {/* Statistics */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {category.postCount > 0 ? (
              <span>{category.postCount} stories to explore</span>
            ) : (
              <span>Coming soon</span>
            )}
          </div>
        </div>

        {/* Explore Button */}
        {category.postCount > 0 && (
          <Link 
            href={categoryUrl}
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-colors font-medium"
          >
            Explore {category.name}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}