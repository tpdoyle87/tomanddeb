import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';
import { 
  Camera, 
  Aperture, 
  Timer, 
  Focus, 
  MapPin, 
  Calendar,
  Download,
  Eye,
  ChevronLeft,
  Maximize2,
  Info
} from 'lucide-react';

interface PhotoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPhoto(slug: string) {
  try {
    const photo = await prisma.photo.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
    });

    if (photo) {
      await prisma.photo.update({
        where: { id: photo.id },
        data: { views: { increment: 1 } },
      });
    }

    return photo;
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
}

async function getRelatedPhotos(currentPhotoId: string, category?: string | null, tags?: string[]) {
  try {
    const photos = await prisma.photo.findMany({
      where: {
        AND: [
          { id: { not: currentPhotoId } },
          { status: 'PUBLISHED' },
          {
            OR: [
              category ? { category } : {},
              tags && tags.length > 0 ? { tags: { hasSome: tags } } : {},
            ].filter(obj => Object.keys(obj).length > 0)
          }
        ],
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });
    return photos;
  } catch (error) {
    console.error('Error fetching related photos:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const photo = await getPhoto(slug);

  if (!photo) {
    return {
      title: 'Photo Not Found',
    };
  }

  return {
    title: `${photo.title} | Photography - ${siteConfig.name}`,
    description: photo.description || `View "${photo.title}" - Travel photography from ${photo.location || 'our journey'}`,
    openGraph: {
      title: photo.title,
      description: photo.description || `Travel photography from ${photo.location || 'our journey'}`,
      images: [photo.webpUrl || photo.thumbnailUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: photo.title,
      description: photo.description || `Travel photography from ${photo.location || 'our journey'}`,
      images: [photo.webpUrl || photo.thumbnailUrl],
    },
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params;
  const photo = await getPhoto(slug);

  if (!photo) {
    notFound();
  }

  const relatedPhotos = await getRelatedPhotos(photo.id, photo.category, photo.tags);

  const handleDownload = async () => {
    'use client';
    await prisma.photo.update({
      where: { id: photo.id },
      data: { downloads: { increment: 1 } },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/photography"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Gallery
            </Link>
            
            <div className="flex items-center gap-4">
              <a
                href={photo.fullResUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`${photo.slug}-full.jpg`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  fetch('/api/photos/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photoId: photo.id }),
                  });
                }}
              >
                <Download className="h-4 w-4" />
                Download Full Resolution
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Image */}
      <div className="pt-20 pb-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[3/2] md:aspect-[16/9] overflow-hidden rounded-lg bg-gray-800">
            <Image
              src={photo.webpUrl || photo.thumbnailUrl}
              alt={photo.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            
            {/* View Full Resolution Button */}
            <a
              href={photo.fullResUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
              View Full Size
            </a>
          </div>
        </div>
      </div>

      {/* Photo Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{photo.title}</h1>
              {photo.description && (
                <p className="text-lg text-gray-300">{photo.description}</p>
              )}
            </div>

            {/* Location & Date */}
            <div className="flex flex-wrap gap-4 text-gray-400">
              {photo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{photo.location}</span>
                </div>
              )}
              {photo.dateTaken && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(photo.dateTaken).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{photo.views} views</span>
              </div>
              {photo.downloads > 0 && (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>{photo.downloads} downloads</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/photography?tag=${tag}`}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Camera Settings */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Info className="h-5 w-5" />
                Camera Settings
              </h3>
              
              <div className="space-y-3 text-sm">
                {photo.camera && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <span>{photo.camera}</span>
                  </div>
                )}
                {photo.lens && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Focus className="h-4 w-4 text-gray-500" />
                    <span>{photo.lens}</span>
                  </div>
                )}
                {photo.focalLength && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Focus className="h-4 w-4 text-gray-500" />
                    <span>{photo.focalLength}</span>
                  </div>
                )}
                {photo.aperture && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Aperture className="h-4 w-4 text-gray-500" />
                    <span>{photo.aperture}</span>
                  </div>
                )}
                {photo.shutterSpeed && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span>{photo.shutterSpeed}</span>
                  </div>
                )}
                {photo.iso && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="text-gray-500 font-mono text-xs">ISO</span>
                    <span>{photo.iso}</span>
                  </div>
                )}
              </div>

              {/* File Info */}
              {(photo.width || photo.height || photo.fileSize) && (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">File Information</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      {photo.width && photo.height && (
                        <div>Resolution: {photo.width} × {photo.height}</div>
                      )}
                      {photo.fileSize && (
                        <div>File Size: {(photo.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Photos */}
        {relatedPhotos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPhotos.map((relatedPhoto) => (
                <Link
                  key={relatedPhoto.id}
                  href={`/photography/${relatedPhoto.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-800"
                >
                  <Image
                    src={relatedPhoto.webpUrl || relatedPhoto.thumbnailUrl}
                    alt={relatedPhoto.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold">{relatedPhoto.title}</h3>
                    {relatedPhoto.location && (
                      <p className="text-sm text-gray-300">{relatedPhoto.location}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}