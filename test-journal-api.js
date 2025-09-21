const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption functions (matching the API)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.JOURNAL_ENCRYPTION_KEY || '4d67821fb4952497644334b8b1ec18af10e74a9c5b72feda341aed95a4137638';

function encrypt(text) {
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

function decrypt(encryptedData) {
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

async function testEncryptedJournal() {
  try {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.error('Test user not found');
      return;
    }

    console.log('Testing Encrypted Journal Operations...\n');

    // 1. Create encrypted journal entry
    console.log('1. Creating encrypted journal entry...');
    const content = 'This is my private journal content that should be encrypted';
    const encryptedContent = encrypt(content);
    
    const entry = await prisma.journalEntry.create({
      data: {
        title: 'My Private Journal',
        content: '', // Empty in plain text field
        encryptedContent,
        isEncrypted: true,
        mood: 'happy',
        weather: 'sunny',
        location: 'Home',
        tags: ['personal', 'private'],
        authorId: user.id,
      }
    });
    console.log('✓ Created encrypted entry with ID:', entry.id);

    // 2. Read and decrypt
    console.log('\n2. Reading and decrypting journal entry...');
    const retrievedEntry = await prisma.journalEntry.findUnique({
      where: { id: entry.id }
    });
    
    if (retrievedEntry.isEncrypted && retrievedEntry.encryptedContent) {
      const decryptedContent = decrypt(retrievedEntry.encryptedContent);
      console.log('✓ Decrypted content:', decryptedContent.substring(0, 50) + '...');
      console.log('✓ Encryption working correctly:', decryptedContent === content);
    }

    // 3. Update with new encrypted content
    console.log('\n3. Updating with new encrypted content...');
    const newContent = 'Updated private content that is also encrypted';
    const newEncryptedContent = encrypt(newContent);
    
    await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        content: '',
        encryptedContent: newEncryptedContent,
        title: 'Updated Private Journal',
      }
    });
    console.log('✓ Updated entry with new encrypted content');

    // 4. Verify update
    const updatedEntry = await prisma.journalEntry.findUnique({
      where: { id: entry.id }
    });
    
    if (updatedEntry.isEncrypted && updatedEntry.encryptedContent) {
      const decryptedNewContent = decrypt(updatedEntry.encryptedContent);
      console.log('✓ New decrypted content:', decryptedNewContent.substring(0, 50) + '...');
      console.log('✓ Update successful:', decryptedNewContent === newContent);
    }

    // 5. Clean up
    console.log('\n4. Cleaning up test data...');
    await prisma.journalEntry.delete({
      where: { id: entry.id }
    });
    console.log('✓ Deleted test entry');

    console.log('\n✅ All encrypted journal operations completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testEncryptedJournal();