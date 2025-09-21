import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

let storage: Storage | null = null;

function getStorageClient(): Storage {
  if (!storage) {
    const projectId = process.env.GCS_PROJECT_ID;
    const keyFilename = process.env.GCS_KEY_FILE;
    const clientEmail = process.env.GCS_CLIENT_EMAIL;
    const privateKey = process.env.GCS_PRIVATE_KEY;

    if (!projectId) {
      throw new Error('GCS_PROJECT_ID environment variable is not set');
    }

    // Option 1: Use key file
    if (keyFilename) {
      storage = new Storage({
        projectId,
        keyFilename,
      });
    }
    // Option 2: Use inline credentials
    else if (clientEmail && privateKey) {
      storage = new Storage({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        },
      });
    }
    // Option 3: Use Application Default Credentials (for GCP environments)
    else {
      storage = new Storage({
        projectId,
      });
    }
  }
  return storage;
}

export interface UploadOptions {
  bucketName?: string;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options: UploadOptions = {}
): Promise<{ url: string; publicUrl: string; fileName: string }> {
  const {
    bucketName = process.env.GCS_BUCKET_NAME,
    folder = 'uploads',
    isPublic = true, // This is ignored with uniform bucket access
    metadata = {},
  } = options;

  console.log('GCS Upload - Bucket:', bucketName);
  console.log('GCS Upload - Folder:', folder);
  console.log('GCS Upload - File:', filename);
  console.log('GCS Upload - Size:', buffer.length);

  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `${folder}/${timestamp}-${sanitizedFilename}`;

    const file = bucket.file(finalFileName);

    // Convert buffer to stream
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Upload file (without setting public ACL for uniform bucket access)
    console.log('Starting GCS upload stream...');
    await new Promise((resolve, reject) => {
      stream
        .pipe(
          file.createWriteStream({
            metadata: {
              contentType: mimeType,
              metadata: {
                ...metadata,
                uploadedAt: new Date().toISOString(),
              },
            },
            // Don't set public flag - bucket has uniform access control
            resumable: false,
            gzip: true,
          })
        )
        .on('error', (err) => {
          console.error('GCS stream error:', err);
          reject(err);
        })
        .on('finish', () => {
          console.log('GCS upload stream finished');
          resolve(true);
        });
    });

    // Get public URL (bucket should be configured for public access if needed)
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${finalFileName}`;

    console.log('Upload complete - Public URL:', publicUrl);
    return {
      url: file.cloudStorageURI.toString(),
      publicUrl,
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error(`Failed to upload file to Google Cloud Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFromGCS(
  fileName: string,
  bucketName?: string
): Promise<void> {
  const bucket = bucketName || process.env.GCS_BUCKET_NAME;
  
  if (!bucket) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }

  try {
    const storage = getStorageClient();
    await storage.bucket(bucket).file(fileName).delete();
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    throw new Error(`Failed to delete file from Google Cloud Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSignedUrl(
  fileName: string,
  expiresInMinutes: number = 60,
  bucketName?: string
): Promise<string> {
  const bucket = bucketName || process.env.GCS_BUCKET_NAME;
  
  if (!bucket) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }

  try {
    const storage = getStorageClient();
    const [url] = await storage
      .bucket(bucket)
      .file(fileName)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}