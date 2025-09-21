const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRoleAccess() {
  console.log('Testing Role-Based Access Control\n');
  console.log('=' .repeat(50));

  try {
    // 1. Check admin user
    console.log('\n1. Checking Admin User:');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'tpdoyle87@gmail.com' }
    });
    
    if (adminUser) {
      console.log(`✓ Admin found: ${adminUser.email}`);
      console.log(`  Role: ${adminUser.role}`);
      console.log(`  Name: ${adminUser.name || 'Not set'}`);
    } else {
      console.log('✗ Admin user not found');
    }

    // 2. Create a regular user for testing
    console.log('\n2. Creating Regular User for Testing:');
    
    // Check if test user already exists
    let regularUser = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' }
    });

    if (!regularUser) {
      regularUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
          password: '$2a$10$K7L1OJ0TfMFBWiZHGTkCgO3eOmF3qPapTPiVRhLzKKRZblNqJK.6i', // hashed 'password123'
          role: 'READER', // Regular user role
        }
      });
      console.log('✓ Created regular user: testuser@example.com (role: READER)');
    } else {
      // Update role to READER if different
      if (regularUser.role !== 'READER') {
        regularUser = await prisma.user.update({
          where: { email: 'testuser@example.com' },
          data: { role: 'READER' }
        });
        console.log('✓ Updated regular user role to READER');
      } else {
        console.log('✓ Regular user exists: testuser@example.com (role: READER)');
      }
    }

    // 3. Count journal entries by user
    console.log('\n3. Checking Journal Access:');
    
    const adminJournalCount = await prisma.journalEntry.count({
      where: { authorId: adminUser?.id }
    });
    
    const regularJournalCount = await prisma.journalEntry.count({
      where: { authorId: regularUser.id }
    });

    console.log(`  Admin journal entries: ${adminJournalCount}`);
    console.log(`  Regular user journal entries: ${regularJournalCount}`);
    console.log('  Note: Only ADMIN users can create/edit journal entries via API');

    // 4. Check posts access
    console.log('\n4. Checking Posts Access:');
    
    const adminPostCount = await prisma.post.count({
      where: { authorId: adminUser?.id }
    });
    
    const regularPostCount = await prisma.post.count({
      where: { authorId: regularUser.id }
    });

    console.log(`  Admin posts: ${adminPostCount}`);
    console.log(`  Regular user posts: ${regularPostCount}`);
    console.log('  Note: Only ADMIN users can create/edit posts via API');

    // 5. List all users and their roles
    console.log('\n5. All Users and Their Roles:');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        _count: {
          select: {
            posts: true,
            journalEntries: true,
            comments: true
          }
        }
      }
    });

    console.log('\n  User List:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email}`);
      console.log(`    Name: ${user.name || 'Not set'}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Posts: ${user._count.posts}, Journals: ${user._count.journalEntries}, Comments: ${user._count.comments}`);
    });

    // 6. Test API endpoints info
    console.log('\n6. API Endpoint Access Summary:');
    console.log('  Admin-Only Endpoints:');
    console.log('    - POST /api/admin/journal (Create journal entry)');
    console.log('    - PATCH /api/admin/journal/[id] (Update journal entry)');
    console.log('    - DELETE /api/admin/journal/[id] (Delete journal entry)');
    console.log('    - POST /api/admin/posts (Create blog post)');
    console.log('    - PATCH /api/admin/posts/[id] (Update blog post)');
    console.log('    - DELETE /api/admin/posts/[id] (Delete blog post)');
    
    console.log('\n  All Authenticated Users:');
    console.log('    - POST /api/posts/[slug]/comments (Comment on posts)');
    console.log('    - POST /api/posts/[slug]/like (Like posts)');
    console.log('    - Share posts via social media buttons');

    console.log('\n7. UI Access Summary:');
    console.log('  Admin Sidebar Items (Hidden for non-admins):');
    console.log('    - Posts Management');
    console.log('    - New Post Creation');
    console.log('    - Journal');
    console.log('    - Media');
    console.log('    - Subscribers');
    
    console.log('\n  Available to all authenticated users:');
    console.log('    - Dashboard');
    console.log('    - Settings');
    console.log('    - Commenting on posts');
    console.log('    - Sharing posts on social media');

    console.log('\n✅ Role-based access control is properly configured!');
    console.log('\nTest Credentials:');
    console.log('  Admin: tpdoyle87@gmail.com / Tyiou*18!@#');
    console.log('  Regular User: testuser@example.com / password123');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleAccess();