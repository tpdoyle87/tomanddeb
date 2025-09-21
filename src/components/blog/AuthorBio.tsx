import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { FollowButton } from './FollowButton';

interface AuthorBioProps {
  author: {
    id: string;
    name: string | null;
    image?: string | null;
    bio?: string | null;
    website?: string | null;
  };
  showFullBio?: boolean;
}

export function AuthorBio({ author, showFullBio = true }: AuthorBioProps) {
  const authorName = author.name || 'Anonymous';
  const hasExtendedInfo = author.bio || author.website;

  if (!showFullBio && !hasExtendedInfo) {
    // Simple inline author display
    return (
      <div className="flex items-center gap-3">
        {author.image ? (
          <Image
            src={author.image}
            alt={authorName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 font-medium text-sm">
              {authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <Link
            href={`/author/${author.id}`}
            className="font-medium text-gray-900 hover:text-teal-600 transition-colors"
          >
            {authorName}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Author Image */}
          <div className="flex-shrink-0">
            {author.image ? (
              <Image
                src={author.image}
                alt={authorName}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold text-xl">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                About {authorName}
              </h3>
              <Link
                href={`/author/${author.id}`}
                className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
              >
                View all posts by {authorName}
              </Link>
            </div>

            {/* Bio */}
            {author.bio && (
              <p className="text-gray-700 mb-3 leading-relaxed">
                {author.bio}
              </p>
            )}

            {/* Website Link */}
            {author.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-4 pt-4 border-t border-teal-200 flex flex-wrap gap-3">
          <Link
            href={`/author/${author.id}`}
            className="inline-flex items-center px-3 py-1 bg-teal-600 text-white text-sm rounded-full hover:bg-teal-700 transition-colors"
          >
            More Posts
          </Link>
          
          {/* Follow/Subscribe actions could go here */}
          <FollowButton authorId={author.id} />
        </div>
      </CardContent>
    </Card>
  );
}