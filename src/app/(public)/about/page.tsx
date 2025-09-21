import { Metadata } from 'next';
import { DynamicAboutSection } from '@/components/blog/DynamicAboutSection';
import { Container } from '@/components/ui';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name} - Our Journey of Adventure, Education & Photography`,
  description: 'Meet the Johnson family! Learn about our travel philosophy, worldschooling approach, and stunning photography from our nomadic lifestyle. Discover how we turned wanderlust into a sustainable way of life.',
  keywords: [
    'about travel blog',
    'family travel',
    'worldschooling family',
    'nomadic lifestyle',
    'travel photography',
    'financial independence',
    'family adventure',
    'remote learning',
    'travel philosophy',
    'sustainable travel',
  ],
  openGraph: {
    title: `About Us | ${siteConfig.name} - Our Journey of Adventure, Education & Photography`,
    description: 'Meet the Johnson family! Learn about our travel philosophy, worldschooling approach, and stunning photography from our nomadic lifestyle.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Us | ${siteConfig.name} - Our Journey of Adventure, Education & Photography`,
    description: 'Meet the Johnson family! Learn about our travel philosophy, worldschooling approach, and stunning photography from our nomadic lifestyle.',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Container className="py-12 md:py-16">
        <DynamicAboutSection />
      </Container>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": `About Us - ${siteConfig.name}`,
            "description": "Learn about the Johnson family's journey combining travel, worldschooling, and stunning photography to document their nomadic lifestyle.",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/about`,
            "mainEntity": {
              "@type": "Organization",
              "name": siteConfig.name,
              "description": "A family travel blog focusing on adventures, worldschooling, and travel photography.",
              "foundingDate": "2021",
              "founder": [
                {
                  "@type": "Person",
                  "name": "Mark Johnson",
                  "jobTitle": "Photographer & Travel Blogger",
                  "description": "15+ years of photography experience, capturing stunning moments from travels around the world."
                },
                {
                  "@type": "Person",
                  "name": "Sarah Johnson", 
                  "jobTitle": "Education Specialist & Travel Blogger",
                  "description": "Background in education and curriculum development, specializing in worldschooling approaches."
                }
              ],
              "sameAs": [
                siteConfig.social.instagram,
                siteConfig.social.twitter,
                siteConfig.social.youtube
              ]
            },
            "about": [
              {
                "@type": "Thing",
                "name": "Family Travel",
                "description": "Authentic travel experiences and cultural immersion with children"
              },
              {
                "@type": "Thing", 
                "name": "Worldschooling",
                "description": "Educational approach combining travel with learning using the world as a classroom"
              },
              {
                "@type": "Thing",
                "name": "Travel Photography",
                "description": "Stunning travel photography capturing the beauty of destinations around the world"
              }
            ]
          })
        }}
      />
    </main>
  );
}