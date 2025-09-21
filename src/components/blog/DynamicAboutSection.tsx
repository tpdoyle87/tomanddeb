'use client';

import { useState, useEffect } from 'react';
import { AboutSection } from './AboutSection';

interface PageData {
  title: string;
  content: string;
  featuredImage?: string;
}

export function DynamicAboutSection() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutPage();
  }, []);

  const fetchAboutPage = async () => {
    try {
      const response = await fetch('/api/pages/about');
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
      }
    } catch (error) {
      console.error('Failed to fetch about page:', error);
    } finally {
      setLoading(false);
    }
  };

  // If we have dynamic content, render it
  if (pageData?.content) {
    return (
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-secondary mb-6">
            {pageData.title || 'About Our Journey'}
          </h1>
        </section>

        {/* Dynamic Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />

        {pageData.featuredImage && (
          <div className="max-w-4xl mx-auto">
            <img
              src={pageData.featuredImage}
              alt={pageData.title}
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        )}
      </div>
    );
  }

  // Fall back to static content
  return <AboutSection />;
}