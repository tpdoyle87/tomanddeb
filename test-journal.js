const baseUrl = 'http://localhost:3003';

// Helper function to login and get session cookie
async function login() {
  const response = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: 'test@example.com',
      password: 'testpassword123',
      csrfToken: 'test', // This might need adjustment based on NextAuth config
    }),
    redirect: 'manual',
  });

  const cookies = response.headers.get('set-cookie');
  console.log('Login response status:', response.status);
  return cookies;
}

// Test journal CRUD operations
async function testJournalCRUD() {
  try {
    // For testing without auth, let's directly create a journal entry in the database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.error('Test user not found');
      return;
    }

    console.log('Testing Journal CRUD Operations...\n');

    // 1. CREATE - Test creating a journal entry
    console.log('1. CREATE: Creating new journal entry...');
    const newEntry = await prisma.journalEntry.create({
      data: {
        title: 'Test Journal Entry',
        content: 'This is a test journal entry content',
        mood: 'happy',
        weather: 'sunny',
        location: 'Test Location',
        tags: ['test', 'demo'],
        authorId: user.id,
        isEncrypted: false, // For now, let's test without encryption
      }
    });
    console.log('✓ Created entry with ID:', newEntry.id);

    // 2. READ - Test reading journal entries
    console.log('\n2. READ: Fetching all journal entries...');
    const entries = await prisma.journalEntry.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✓ Found ${entries.length} entries`);

    // 3. UPDATE - Test updating a journal entry
    console.log('\n3. UPDATE: Updating journal entry...');
    const updatedEntry = await prisma.journalEntry.update({
      where: { id: newEntry.id },
      data: {
        title: 'Updated Test Journal Entry',
        mood: 'excited',
      }
    });
    console.log('✓ Updated entry title to:', updatedEntry.title);

    // 4. DELETE - Test deleting a journal entry
    console.log('\n4. DELETE: Deleting journal entry...');
    await prisma.journalEntry.delete({
      where: { id: newEntry.id }
    });
    console.log('✓ Deleted entry successfully');

    // Verify deletion
    const remainingEntries = await prisma.journalEntry.findMany({
      where: { authorId: user.id }
    });
    console.log(`\n✓ Remaining entries: ${remainingEntries.length}`);

    console.log('\n✅ All CRUD operations completed successfully!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testJournalCRUD();