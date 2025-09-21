import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    photo: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('/api/admin/photos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/photos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not admin or editor', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'user@test.com', role: 'READER' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/photos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return photos with pagination', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      const mockPhotos = [
        {
          id: '1',
          slug: 'test-photo',
          title: 'Test Photo',
          status: 'PUBLISHED',
        },
      ];

      vi.mocked(prisma.photo.findMany).mockResolvedValue(mockPhotos as any);
      vi.mocked(prisma.photo.count).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/admin/photos?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.photos).toEqual(mockPhotos);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      });
    });

    it('should handle search parameter', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      vi.mocked(prisma.photo.findMany).mockResolvedValue([]);
      vi.mocked(prisma.photo.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/admin/photos?search=landscape');
      const response = await GET(request);

      expect(prisma.photo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'landscape', mode: 'insensitive' } },
              { description: { contains: 'landscape', mode: 'insensitive' } },
              { location: { contains: 'landscape', mode: 'insensitive' } },
            ]),
          }),
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe('POST', () => {
    const validPhotoData = {
      slug: 'test-photo',
      title: 'Test Photo',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      webpUrl: 'https://example.com/photo.webp',
      fullResUrl: 'https://example.com/full.jpg',
      status: 'PUBLISHED',
    };

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'POST',
        body: JSON.stringify(validPhotoData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create a new photo', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      vi.mocked(prisma.photo.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.photo.create).mockResolvedValue({
        id: 'new-id',
        ...validPhotoData,
        publishedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'POST',
        body: JSON.stringify(validPhotoData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-id');
      expect(data.title).toBe('Test Photo');
    });

    it('should return 400 if slug already exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      vi.mocked(prisma.photo.findUnique).mockResolvedValue({
        id: 'existing',
        slug: 'test-photo',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'POST',
        body: JSON.stringify(validPhotoData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('A photo with this slug already exists');
    });

    it('should return 400 for invalid data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      const invalidData = {
        slug: 'Invalid Slug!', // Invalid slug format
        title: '',
        thumbnailUrl: 'not-a-url',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
      expect(data.details).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('should return 401 if user is not admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'editor@test.com', role: 'EDITOR' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'DELETE',
        body: JSON.stringify({ ids: ['1', '2'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete multiple photos', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      vi.mocked(prisma.photo.deleteMany).mockResolvedValue({ count: 2 });

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'DELETE',
        body: JSON.stringify({ ids: ['1', '2'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Deleted 2 photos');
      expect(data.count).toBe(2);
    });

    it('should return 400 if no IDs provided', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/photos', {
        method: 'DELETE',
        body: JSON.stringify({ ids: [] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No photo IDs provided');
    });
  });
});