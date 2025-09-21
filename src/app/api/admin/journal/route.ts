import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): string {
  const key = process.env.JOURNAL_ENCRYPTION_KEY;
  if (!key) {
    console.warn('WARNING: JOURNAL_ENCRYPTION_KEY not set in environment. Using generated key.');
    return crypto.randomBytes(32).toString('hex');
  }
  return key;
}

function encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
  const ENCRYPTION_KEY = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encryptedData: { encrypted: string; iv: string; authTag: string }): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function GET(request: NextRequest) {
  try {
    // Only admins can access journal entries
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const mood = searchParams.get('mood');
    const privacy = searchParams.get('privacy');

    const where: any = {
      authorId: user.id, // Admin can only see their own journal entries
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add mood filter
    if (mood && mood !== 'ALL') {
      where.mood = mood;
    }


    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt content for each entry
    const decryptedEntries = entries.map(entry => {
      const result: any = { ...entry };
      if (entry.isEncrypted && entry.encryptedContent) {
        try {
          const decryptedContent = decrypt(entry.encryptedContent as any);
          result.content = decryptedContent;
        } catch (error) {
          console.error('Failed to decrypt entry:', entry.id, error);
          result.content = '[Content could not be decrypted]';
        }
      }
      delete result.encryptedContent;
      return result;
    });

    return NextResponse.json(decryptedEntries);

  } catch (error) {
    console.error('Journal entries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins can create journal entries
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const body = await request.json();
    const {
      title,
      content,
      mood,
      weather,
      location,
      tags = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Encrypt the content
    const encryptedContent = encrypt(content);

    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content: '', // Store empty string in plain text field
        encryptedContent,
        isEncrypted: true,
        mood,
        weather,
        location,
        tags,
        authorId: user.id,
      },
    });

    // Return the entry with decrypted content
    const responseEntry: any = {
      ...entry,
      content
    };
    delete responseEntry.encryptedContent;

    return NextResponse.json(responseEntry, { status: 201 });

  } catch (error) {
    console.error('Journal entry creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}