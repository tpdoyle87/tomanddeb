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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can access journal entries
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Decrypt content if encrypted
    let responseEntry: any = { ...entry };
    if (entry.isEncrypted && entry.encryptedContent) {
      try {
        const decryptedContent = decrypt(entry.encryptedContent as any);
        responseEntry = {
          ...entry,
          content: decryptedContent
        };
        delete responseEntry.encryptedContent;
      } catch (error) {
        console.error('Failed to decrypt entry:', entry.id, error);
        responseEntry = {
          ...entry,
          content: '[Content could not be decrypted]'
        };
        delete responseEntry.encryptedContent;
      }
    }

    return NextResponse.json(responseEntry);
  } catch (error) {
    console.error('Journal entry fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can access journal entries
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      content,
      mood,
      weather,
      location,
      tags,
    } = body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      // Encrypt the new content
      const encryptedContent = encrypt(content);
      updateData.content = ''; // Store empty string in plain text field
      updateData.encryptedContent = encryptedContent;
      updateData.isEncrypted = true;
    }
    if (mood !== undefined) updateData.mood = mood;
    if (weather !== undefined) updateData.weather = weather;
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = tags;

    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    });

    // Return the entry with decrypted content if it was updated
    let responseEntry: any = { ...updatedEntry };
    if (content !== undefined) {
      responseEntry = {
        ...updatedEntry,
        content
      };
      delete responseEntry.encryptedContent;
    } else if (updatedEntry.isEncrypted && updatedEntry.encryptedContent) {
      try {
        const decryptedContent = decrypt(updatedEntry.encryptedContent as any);
        responseEntry = {
          ...updatedEntry,
          content: decryptedContent
        };
        delete responseEntry.encryptedContent;
      } catch (error) {
        console.error('Failed to decrypt entry:', updatedEntry.id, error);
      }
    }

    return NextResponse.json(responseEntry);
  } catch (error) {
    console.error('Journal entry update error:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only admins can access journal entries
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Journal entry deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}