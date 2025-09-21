import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { DetailedBlogPost } from '@/types/blog';

interface ArticleContentProps {
  post: DetailedBlogPost;
}

// Custom components for ReactMarkdown
const MarkdownComponents = {
  // Custom image renderer with Next.js Image optimization
  img: ({ src, alt, ...props }: any) => {
    if (!src) return null;
    
    return (
      <div className="relative w-full my-6">
        <Image
          src={src}
          alt={alt || ''}
          width={800}
          height={400}
          className="rounded-lg object-cover w-full h-auto"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
        />
        {alt && (
          <p className="text-sm text-gray-600 italic text-center mt-2">
            {alt}
          </p>
        )}
      </div>
    );
  },

  // Custom heading renderers with proper typography
  h1: ({ children }: any) => (
    <h1 className="text-3xl lg:text-4xl font-bold font-playfair text-gray-900 mt-8 mb-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl lg:text-3xl font-bold font-playfair text-gray-900 mt-8 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl lg:text-2xl font-semibold font-playfair text-gray-900 mt-6 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mt-6 mb-3">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-base lg:text-lg font-semibold text-gray-900 mt-4 mb-2">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-sm lg:text-base font-semibold text-gray-900 mt-4 mb-2">
      {children}
    </h6>
  ),

  // Paragraph styling
  p: ({ children }: any) => (
    <p className="text-gray-700 leading-relaxed mb-4 text-base lg:text-lg">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-gray-700 text-base lg:text-lg">
      {children}
    </li>
  ),

  // Links
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-teal-600 hover:text-teal-700 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : '_self'}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),

  // Blockquotes
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-6 bg-teal-50 rounded-r-lg italic text-gray-800">
      {children}
    </blockquote>
  ),

  // Code blocks and inline code
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code
          className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="relative my-6">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },

  // Tables
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gray-50">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
      {children}
    </td>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-8 border-t border-gray-300" />
  ),
};

export function ArticleContent({ post }: ArticleContentProps) {
  return (
    <article className="prose prose-lg max-w-none">
      {/* Article Images Gallery - if post has additional images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.images.slice(0, 6).map((image) => (
              <div key={image.id} className="relative aspect-video">
                <Image
                  src={image.url}
                  alt={image.alt || post.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs rounded-b-lg">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
          {post.images.length > 6 && (
            <p className="text-gray-600 text-sm mt-2">
              And {post.images.length - 6} more images...
            </p>
          )}
        </div>
      )}

      {/* Main Article Content */}
      <div className="article-content">
        <ReactMarkdown
          components={MarkdownComponents}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Location Information */}
      {(post.location || post.country || post.coordinates) && (
        <div className="mt-8 p-6 bg-teal-50 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {post.location && (
              <div>
                <span className="font-medium text-teal-800">Location:</span>
                <span className="ml-2 text-gray-700">{post.location}</span>
              </div>
            )}
            {post.country && (
              <div>
                <span className="font-medium text-teal-800">Country:</span>
                <span className="ml-2 text-gray-700">{post.country}</span>
              </div>
            )}
            {post.coordinates && (
              <div className="md:col-span-2">
                <span className="font-medium text-teal-800">Coordinates:</span>
                <span className="ml-2 text-gray-700">
                  {post.coordinates.lat.toFixed(6)}, {post.coordinates.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}