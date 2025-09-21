'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Camera, Info, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function NewPhotoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    location: '',
    dateTaken: '',
    camera: '',
    lens: '',
    focalLength: '',
    aperture: '',
    shutterSpeed: '',
    iso: '',
    thumbnailUrl: '',
    webpUrl: '',
    fullResUrl: '',
    width: '',
    height: '',
    fileSize: '',
    category: '',
    tags: '',
    featured: false,
    status: 'DRAFT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from title if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const photoData = {
        ...formData,
        slug,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
        fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
        description: formData.description || null,
        location: formData.location || null,
        dateTaken: formData.dateTaken || null,
        camera: formData.camera || null,
        lens: formData.lens || null,
        focalLength: formData.focalLength || null,
        aperture: formData.aperture || null,
        shutterSpeed: formData.shutterSpeed || null,
        iso: formData.iso || null,
        category: formData.category || null,
      };

      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create photo');
      }

      const photo = await response.json();
      router.push('/admin/photos');
    } catch (error) {
      console.error('Error creating photo:', error);
      alert(error instanceof Error ? error.message : 'Failed to create photo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated' || !['ADMIN', 'EDITOR'].includes(session?.user?.role || '')) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/photos">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Photos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Photo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Sunset over the mountains"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug (URL)
                </label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="auto-generated-from-title"
                  pattern="^[a-z0-9-]+$"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="A beautiful sunset captured during our trek..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Swiss Alps, Switzerland"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Taken
                </label>
                <Input
                  type="datetime-local"
                  name="dateTaken"
                  value={formData.dateTaken}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Image Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Thumbnail URL <span className="text-red-500">*</span>
              </label>
              <Input
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                required
                type="url"
                placeholder="https://storage.example.com/thumb_image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Small thumbnail for grid views (400x300)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                WebP URL <span className="text-red-500">*</span>
              </label>
              <Input
                name="webpUrl"
                value={formData.webpUrl}
                onChange={handleChange}
                required
                type="url"
                placeholder="https://storage.example.com/image.webp"
              />
              <p className="text-xs text-gray-500 mt-1">Optimized WebP version for display</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Resolution URL <span className="text-red-500">*</span>
              </label>
              <Input
                name="fullResUrl"
                value={formData.fullResUrl}
                onChange={handleChange}
                required
                type="url"
                placeholder="https://storage.example.com/full_image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Original high-resolution image</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Width (px)
                </label>
                <Input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="6000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Height (px)
                </label>
                <Input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="4000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  File Size (bytes)
                </label>
                <Input
                  type="number"
                  name="fileSize"
                  value={formData.fileSize}
                  onChange={handleChange}
                  placeholder="5242880"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Camera
                </label>
                <Input
                  name="camera"
                  value={formData.camera}
                  onChange={handleChange}
                  placeholder="Canon EOS R5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lens
                </label>
                <Input
                  name="lens"
                  value={formData.lens}
                  onChange={handleChange}
                  placeholder="24-70mm f/2.8"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Focal Length
                </label>
                <Input
                  name="focalLength"
                  value={formData.focalLength}
                  onChange={handleChange}
                  placeholder="35mm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Aperture
                </label>
                <Input
                  name="aperture"
                  value={formData.aperture}
                  onChange={handleChange}
                  placeholder="f/2.8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shutter Speed
                </label>
                <Input
                  name="shutterSpeed"
                  value={formData.shutterSpeed}
                  onChange={handleChange}
                  placeholder="1/500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  ISO
                </label>
                <Input
                  name="iso"
                  value={formData.iso}
                  onChange={handleChange}
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  <option value="Landscapes">Landscapes</option>
                  <option value="Culture">Culture</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Street">Street</option>
                  <option value="Nature">Nature</option>
                  <option value="People">People</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="sunset, mountains, landscape, nature"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm font-medium">Featured Photo</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/photos">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Photo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}