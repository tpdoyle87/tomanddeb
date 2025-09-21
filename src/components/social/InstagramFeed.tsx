'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Placeholder Instagram post data
const placeholderPosts = [
  {
    id: '1',
    image: '/placeholder-instagram-1.jpg',
    caption: 'Amazing sunset from our balcony in Bali! The kids are loving this view every evening. 🌅',
    likes: 234,
    comments: 12,
    permalink: 'https://instagram.com/p/example1',
    timestamp: '2024-03-15T18:30:00Z',
  },
  {
    id: '2',
    image: '/placeholder-instagram-2.jpg',
    caption: 'Worldschooling math lesson at the local market. Learning currency exchange in real life! 📊',
    likes: 189,
    comments: 8,
    permalink: 'https://instagram.com/p/example2',
    timestamp: '2024-03-14T10:15:00Z',
  },
  {
    id: '3',
    image: '/placeholder-instagram-3.jpg',
    caption: 'Family bike adventure through rice terraces. Exercise + education + family time = perfect day! 🚲',
    likes: 312,
    comments: 24,
    permalink: 'https://instagram.com/p/example3',
    timestamp: '2024-03-13T16:45:00Z',
  },
  {
    id: '4',
    image: '/placeholder-instagram-4.jpg',
    caption: 'Local cooking class turned into the best cultural lesson we\'ve had! 🍜',
    likes: 276,
    comments: 18,
    permalink: 'https://instagram.com/p/example4',
    timestamp: '2024-03-12T14:20:00Z',
  },
  {
    id: '5',
    image: '/placeholder-instagram-5.jpg',
    caption: 'Working from this coffee shop while the kids explore the playground next door. Digital nomad life! ☕',
    likes: 198,
    comments: 15,
    permalink: 'https://instagram.com/p/example5',
    timestamp: '2024-03-11T09:30:00Z',
  },
  {
    id: '6',
    image: '/placeholder-instagram-6.jpg',
    caption: 'Beach day geography lesson! Learning about tides, erosion, and marine ecosystems. 🏖️',
    likes: 356,
    comments: 22,
    permalink: 'https://instagram.com/p/example6',
    timestamp: '2024-03-10T17:00:00Z',
  },
];

interface InstagramFeedProps {
  variant?: 'grid' | 'carousel';
  showHeader?: boolean;
  maxPosts?: number;
  username?: string;
}

export function InstagramFeed({ 
  variant = 'grid',
  showHeader = true,
  maxPosts = 6,
  username = 'wanderingminds_family'
}: InstagramFeedProps) {
  const postsToShow = placeholderPosts.slice(0, maxPosts);
  const isGrid = variant === 'grid';

  const InstagramPost = ({ post }: { post: typeof placeholderPosts[0] }) => (
    <div className="relative group cursor-pointer">
      {/* Post Image */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden rounded-lg">
        {/* Placeholder gradient since we don't have real images */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Instagram className="h-8 w-8" />
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Caption (only show in carousel mode) */}
      {!isGrid && (
        <div className="mt-3 px-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.caption}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{post.comments}</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(post.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="overflow-hidden">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Follow Our Journey</CardTitle>
                <p className="text-sm text-gray-500">@{username}</p>
              </div>
            </div>
            <Link
              href={`https://instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Instagram className="h-4 w-4 mr-1" />
              Follow
            </Link>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-4">
        {isGrid ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {postsToShow.map((post) => (
              <Link
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <InstagramPost post={post} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {postsToShow.map((post) => (
              <Link
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <InstagramPost post={post} />
              </Link>
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="mt-6 text-center">
          <Link
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
          >
            View More on Instagram
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Integration Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> This is a placeholder component. To display real Instagram content, 
            you'll need to integrate with the Instagram Basic Display API or use a third-party service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}