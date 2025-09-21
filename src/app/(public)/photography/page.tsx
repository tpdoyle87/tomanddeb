import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';
import { Camera, MapPin, Calendar, Eye, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: `Photography | ${siteConfig.name} - Travel Photography Gallery`,
  description: 'Explore our collection of travel photography from around the world. High-resolution images capturing the beauty of our journey.',
  keywords: [
    'travel photography',
    'landscape photography',
    'world photography',
    'travel photos',
    'photography gallery',
    'high resolution photos',
  ],
  openGraph: {
    title: `Photography | ${siteConfig.name}`,
    description: 'Explore our collection of travel photography from around the world.',
    images: ['/images/photography-hero.jpg'],
  },
  twitter: {
    title: `Photography | ${siteConfig.name}`,
    description: 'Explore our collection of travel photography from around the world.',
  },
};

async function getPhotos() {
  try {
    const photos = await prisma.photo.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
    return photos;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export default async function PhotographyPage() {
  const photos = await getPhotos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel Photography
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A visual journey through our adventures. Each photograph tells a story of the 
              incredible places we've discovered and the moments that have taken our breath away.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Our photography collection is coming soon. Check back to see stunning travel photos from around the world!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photos.map((photo) => (
              <Link
                key={photo.id}
                href={`/photography/${photo.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <Image
                  src={photo.webpUrl || photo.thumbnailUrl}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold mb-2">{photo.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-200">
                    {photo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {photo.location}
                      </span>
                    )}
                    {photo.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {photo.views}
                      </span>
                    )}
                  </div>
                </div>

                {/* Featured Badge */}
                {photo.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Filter */}
      {photos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Explore by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['Landscapes', 'Culture', 'Architecture', 'Street', 'Nature', 'People'].map((category) => (
                <button
                  key={category}
                  className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-700 hover:text-indigo-600"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photography Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-12 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">
              Behind the Lens
            </h2>
            <p className="text-lg mb-6 text-indigo-100">
              Learn about our photography process, from capturing the perfect moment to post-processing 
              techniques. Discover the stories behind our favorite shots and get tips for your own 
              travel photography journey.
            </p>
            <Link
              href="/blog?tag=photography-tips"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Read Photography Tips
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}