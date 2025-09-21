# Journal Entry Testing Guide

## Summary of Fixes Applied

### ✅ Completed Fixes:
1. **Created API route for individual journal operations** (`/api/admin/journal/[id]`)
   - Added PATCH method for updating entries
   - Added DELETE method for removing entries
   - Added GET method for fetching single entry

2. **Fixed Edit Functionality**
   - Edit button now properly loads entry data into the form
   - Form switches between "New Entry" and "Edit Entry" modes
   - Updates work correctly through the PATCH endpoint

3. **Fixed Delete Functionality**
   - Delete button now properly removes entries from database
   - Confirmation dialog prevents accidental deletions

4. **Removed Public/Private Toggle**
   - Journal entries are now ALWAYS private (no public option)
   - Removed all UI elements for privacy toggling
   - Updated database schema to remove `isPrivate` field

5. **Implemented Encryption at Rest**
   - All journal content is encrypted using AES-256-GCM
   - Encryption key stored in environment variable
   - Content automatically encrypted on save and decrypted on read

## How to Test the Journal Functionality

### Prerequisites
1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
   The server runs on port 3003 (or 3002/3001 if those are free)

2. Ensure you have a test user account:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - Role: ADMIN

### Testing Steps

#### 1. Access the Journal Page
1. Navigate to `http://localhost:3003/auth/login`
2. Login with the test credentials
3. Navigate to `http://localhost:3003/admin/journal`

#### 2. Create a New Journal Entry
1. Click the "New Entry" button
2. Fill in the form:
   - Title: Required field
   - Content: Required field (using the rich text editor)
   - Mood: Optional dropdown
   - Weather: Optional dropdown
   - Location: Optional text field
   - Tags: Optional, add multiple tags
3. Note the privacy notice: "All journal entries are private and encrypted"
4. Click "Save Entry"

#### 3. Edit an Existing Entry
1. Find an entry in the list
2. Click the Edit button (pencil icon)
3. The form should open with the entry's current data
4. Make changes to any field
5. Click "Update Entry"
6. Verify the changes are reflected in the list

#### 4. Delete an Entry
1. Find an entry in the list
2. Click the Delete button (trash icon)
3. Confirm the deletion in the dialog
4. Verify the entry is removed from the list

#### 5. Search and Filter
1. Use the search bar to find entries by title, content, or location
2. Use the mood filter dropdown to show only entries with specific moods
3. Verify the filtering works correctly

### Alternative: Simple Journal Page (Without Rich Text Editor)

If you encounter issues with the PostEditor component, use the simplified version:
1. Navigate to `http://localhost:3003/admin/journal-simple`
2. This version uses a plain textarea instead of the rich text editor
3. All other functionality remains the same

### Testing via Command Line

We've created test scripts to verify the functionality:

1. **Test basic CRUD operations:**
   ```bash
   node test-journal.js
   ```

2. **Test encrypted journal operations:**
   ```bash
   JOURNAL_ENCRYPTION_KEY=4d67821fb4952497644334b8b1ec18af10e74a9c5b72feda341aed95a4137638 node test-journal-api.js
   ```

## Technical Details

### Encryption Implementation
- Algorithm: AES-256-GCM
- Key Length: 256 bits (32 bytes, 64 hex characters)
- Environment Variable: `JOURNAL_ENCRYPTION_KEY`
- Storage: Content is stored encrypted in `encryptedContent` field as JSON

### Database Schema Changes
```prisma
model JournalEntry {
  id               String   @id @default(cuid())
  title            String
  content          String   @db.Text  // Empty when encrypted
  encryptedContent Json?    // Stores {encrypted, iv, authTag}
  isEncrypted      Boolean  @default(false)
  mood             String?
  weather          String?
  location         String?
  tags             String[]
  authorId         String
  // ... other fields
}
```

### Security Features
1. **Authentication Required**: All journal endpoints require user authentication
2. **User Isolation**: Users can only see/edit/delete their own entries
3. **Encryption at Rest**: Content is encrypted before database storage
4. **No Public Access**: Journal entries cannot be made public

## Troubleshooting

### If you get a 403 Unauthorized error:
- Ensure you're logged in
- Check that your user has the correct role (ADMIN or AUTHOR)

### If the PostEditor doesn't load:
- Use the simplified journal page at `/admin/journal-simple`
- Check browser console for JavaScript errors
- Ensure all TipTap packages are installed

### If encryption fails:
- Verify `JOURNAL_ENCRYPTION_KEY` is set in `.env`
- Key must be exactly 64 hex characters
- Restart the dev server after changing the key

### If entries don't appear:
- Check the browser network tab for API errors
- Look at server logs for database errors
- Verify the database migration completed successfully

## API Endpoints

### GET /api/admin/journal
- Fetches all journal entries for the authenticated user
- Supports query parameters: `search`, `mood`
- Returns decrypted content

### POST /api/admin/journal
- Creates a new journal entry
- Automatically encrypts content
- Requires: `title`, `content`

### GET /api/admin/journal/[id]
- Fetches a single journal entry
- Returns decrypted content

### PATCH /api/admin/journal/[id]
- Updates an existing entry
- Re-encrypts content if changed
- Can update any field

### DELETE /api/admin/journal/[id]
- Permanently deletes an entry
- No soft delete - entry is completely removed

## Next Steps

To further improve the journal functionality:
1. Add import/export functionality
2. Implement full-text search with encryption support
3. Add attachment support for images
4. Create a mobile-friendly interface
5. Add offline support with local encryption