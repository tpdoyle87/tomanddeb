'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CategoryWithStats } from '@/types/blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface CategoryGridProps {
  categories: CategoryWithStats[];
  className?: string;
}

export function CategoryGrid({ categories, className = '' }: CategoryGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
            {/* Category Image */}
            <div className="relative h-48 overflow-hidden">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-4xl text-primary/60">
                    {getCategoryIcon(category.slug)}
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              
              {/* Post Count Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-secondary text-sm font-semibold px-3 py-1 rounded-full">
                {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
              </div>
            </div>

            {/* Content */}
            <CardHeader className="pb-2">
              <CardTitle className="group-hover:text-primary transition-colors duration-200">
                {category.name}
              </CardTitle>
            </CardHeader>

            {category.description && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {category.description}
                </p>
              </CardContent>
            )}

            {/* Action Area */}
            <CardContent className="pt-0 pb-6">
              <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                Explore {category.name}
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// Helper function to get category icons
function getCategoryIcon(slug: string): string {
  switch (slug.toLowerCase()) {
    case 'travel':
      return '✈️';
    case 'worldschooling':
      return '🎓';
    case 'photography':
      return '📸';
    default:
      return '📝';
  }
}

// Add line-clamp utility to globals.css if not already present
declare global {
  interface CSSStyleDeclaration {
    lineClamp?: string;
  }
}