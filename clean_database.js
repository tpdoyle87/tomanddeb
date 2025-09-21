const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Delete all posts (this will cascade delete comments, etc.)
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`Deleted ${deletedPosts.count} posts`);
    
    // Delete all photos
    const deletedPhotos = await prisma.photo.deleteMany({});
    console.log(`Deleted ${deletedPhotos.count} photos`);
    
    // Delete all journal entries
    const deletedJournals = await prisma.journalEntry.deleteMany({});
    console.log(`Deleted ${deletedJournals.count} journal entries`);
    
    // Delete all images
    const deletedImages = await prisma.image.deleteMany({});
    console.log(`Deleted ${deletedImages.count} images`);
    
    // Delete all subscribers (optional - you might want to keep real ones)
    const deletedSubscribers = await prisma.subscriber.deleteMany({});
    console.log(`Deleted ${deletedSubscribers.count} subscribers`);
    
    // Keep categories, tags, and admin user - these are useful
    
    console.log('Database cleanup complete!');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
