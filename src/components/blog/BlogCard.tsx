import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface BlogCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    publishedAt?: Date | null;
    location?: string | null;
    country?: string | null;
    readTime?: number | null;
    author?: {
      name?: string | null;
      image?: string | null;
    };
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const publishDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const location = [post.location, post.country]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl text-muted-foreground/50">📷</div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>
        
        {post.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {publishDate && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{publishDate}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          
          {post.readTime && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>
        
        {post.author && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
            {post.author.image && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                <img
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {post.author.name}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}