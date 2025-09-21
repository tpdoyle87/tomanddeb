'use client';

import Image from 'next/image';
import { CategoryWithStats } from '@/types/blog';

interface CategoryHeroProps {
  category: CategoryWithStats;
}

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <section className="relative w-full h-96 md:h-[500px] bg-gray-900 overflow-hidden">
      {/* Background Image */}
      {category.image && (
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
              {category.name}
            </h1>
            
            {category.description && (
              <p className="text-xl md:text-2xl text-gray-200 mb-6 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg">
                  {category.postCount} {category.postCount === 1 ? 'Post' : 'Posts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
    </section>
  );
}