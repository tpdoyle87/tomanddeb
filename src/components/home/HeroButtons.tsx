'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link 
        href="/about" 
        className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-teal-500 text-white hover:bg-teal-600 focus-visible:ring-teal-500 h-11 px-8 text-lg"
      >
        Our Story
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      <Link 
        href="/category/travel"
        className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500 h-11 px-8 text-lg"
      >
        Explore Destinations
      </Link>
    </div>
  );
}