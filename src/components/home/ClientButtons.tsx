'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ViewAllPostsButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" className={className} asChild>
      <Link href="/blog" className="inline-flex items-center">
        View All Posts
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

export function LearnMoreButton({ href }: { href: string }) {
  return (
    <Button variant="link" asChild>
      <Link href={href} className="inline-flex items-center">
        Learn more
        <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}

export function AboutButton() {
  return (
    <Button variant="outline" asChild>
      <Link href="/about">Learn More About Our Journey</Link>
    </Button>
  );
}