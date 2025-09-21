// Blog post type for API responses
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt: Date | string;
  readTime?: number | null;
  views?: number;
  location?: string | null;
  country?: string | null;
  author: {
    name: string | null;
    image?: string | null;
  };
  category?: {
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    name: string;
    slug: string;
  }>;
  commentCount?: number;
}

// Category with post count
export interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  postCount: number;
}

// API response types
export interface LatestPostsResponse {
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
}

export interface FeaturedPostsResponse {
  posts: BlogPost[];
  total: number;
}

export interface CategoryStatsResponse {
  categories: CategoryWithStats[];
  stats: {
    totalPosts: number;
    totalCategories: number;
    mostPopularCategory: CategoryWithStats | null;
  };
}

// Extended blog post type for full article display
export interface DetailedBlogPost extends BlogPost {
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
    bio?: string | null;
    website?: string | null;
  };
  images?: Array<{
    id: string;
    url: string;
    alt?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
  }>;
  comments?: Comment[];
}

// Comment type
export interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH';
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestWebsite?: string | null;
  replies?: Comment[];
}

// Search and filter types
export interface BlogSearchParams {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  sortBy?: 'recent' | 'popular' | 'oldest';
  page?: number;
  limit?: number;
}

export interface BlogSearchResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  filters?: {
    categories: Array<{ name: string; slug: string; count: number }>;
    tags: Array<{ name: string; slug: string; count: number }>;
    authors: Array<{ name: string; id: string; count: number }>;
  };
}

// Related posts response
export interface RelatedPostsResponse {
  posts: BlogPost[];
}

// View count update response
export interface ViewCountResponse {
  success: boolean;
  views: number;
}

// Comment creation request
export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
  // For authenticated users
  authorId?: string;
  // For guest comments
  guestName?: string;
  guestEmail?: string;
  guestWebsite?: string;
}

export interface CreateCommentResponse {
  success: boolean;
  comment?: Comment;
  message: string;
  error?: string;
}

// Newsletter subscription types
export interface NewsletterSubscriber {
  email: string;
  name: string | null;
  status: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  subscriber?: NewsletterSubscriber;
  error?: string;
  details?: Array<{
    path: string[];
    message: string;
  }>;
}