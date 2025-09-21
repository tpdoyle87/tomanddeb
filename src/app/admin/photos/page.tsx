'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Camera,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Photo {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  location?: string | null;
  thumbnailUrl: string;
  webpUrl: string;
  fullResUrl: string;
  category?: string | null;
  tags: string[];
  featured: boolean;
  status: string;
  views: number;
  downloads: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminPhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const response = await fetch(`/api/admin/photos?${params}`);
      if (!response.ok) throw new Error('Failed to fetch photos');

      const data = await response.json();
      setPhotos(data.photos);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPhotos();
    }
  }, [status, fetchPhotos]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/admin/photos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete photo');

      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPhotos.length} photos?`)) return;

    try {
      const response = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPhotos }),
      });

      if (!response.ok) throw new Error('Failed to delete photos');

      setSelectedPhotos([]);
      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photos:', error);
      alert('Failed to delete photos');
    }
  };

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev =>
      prev.includes(id)
        ? prev.filter(photoId => photoId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photos.map(p => p.id));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPhotos();
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated' || !['ADMIN', 'EDITOR'].includes(session?.user?.role || '')) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Photography Management</h1>
          <div className="flex gap-3">
            {selectedPhotos.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedPhotos.length})
              </Button>
            )}
            <Link href="/admin/photos/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Photo
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-40">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="w-40">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Categories</option>
                <option value="Landscapes">Landscapes</option>
                <option value="Culture">Culture</option>
                <option value="Architecture">Architecture</option>
                <option value="Street">Street</option>
                <option value="Nature">Nature</option>
                <option value="People">People</option>
              </select>
            </div>

            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </Card>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-12">Loading photos...</div>
      ) : photos.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photos found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter || categoryFilter
              ? 'Try adjusting your filters'
              : 'Start by adding your first photo'}
          </p>
          {!searchQuery && !statusFilter && !categoryFilter && (
            <Link href="/admin/photos/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Photo
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPhotos.length === photos.length && photos.length > 0}
                onChange={toggleAllSelection}
                className="rounded"
              />
              <span className="text-sm font-medium">Select All</span>
            </label>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={() => togglePhotoSelection(photo.id)}
                      className="rounded bg-white/80"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      photo.status === 'PUBLISHED'
                        ? 'bg-green-500 text-white'
                        : photo.status === 'DRAFT'
                        ? 'bg-gray-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {photo.status}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {photo.featured && (
                    <div className="absolute bottom-2 left-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 truncate">{photo.title}</h3>
                  {photo.location && (
                    <p className="text-xs text-gray-600 mb-2 truncate">{photo.location}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {photo.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {photo.downloads}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/photos/${photo.id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(photo.id)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}