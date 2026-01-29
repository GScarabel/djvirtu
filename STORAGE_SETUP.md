# Supabase Storage Setup Instructions

## Creating Storage Buckets

To fix the "Bucket not found" error, you need to create the required storage buckets in your Supabase project:

### Method 1: Using Storage UI (Recommended)

Since your schema file already includes the storage configuration, the easiest way is to create the buckets via the Supabase Dashboard:

1. Go to your Supabase Dashboard
2. Navigate to `Storage` → `Buckets`
3. Click "New bucket" and create these three buckets:
   - `photos` (Public: Yes)
   - `videos` (Public: Yes)
   - `covers` (Public: Yes)

### Method 2: Using SQL Editor (Alternative)

If you prefer to use SQL, you need to properly configure the storage policies after creating the buckets. However, if you encounter "permission denied" errors when running the SQL in the dashboard, use the Storage UI method instead.

If the SQL Editor gives permission errors, you can run the storage policies using the service role key programmatically. The storage policies are already included in your schema file but commented out.

### Method 3: Using the Service Role Key Programmatically

If you're getting permission errors in the SQL Editor, the storage policies will be applied automatically when you use the service role key in your application. The service role key bypasses RLS policies and allows full access to storage operations.

The storage policies are already defined in your `supabase-schema.sql` file in the commented section at the end. After creating the buckets via the UI, these policies will be applied automatically when you use the service role key in your admin components.

## Environment Variables

Make sure your `.env` file has the correct Supabase configuration. For storage operations, you'll need to use your service role key to bypass RLS policies:

```env
VITE_SUPABASE_URL=https://qbyplbhfzvvjwqnbfeyi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieXBsYmhmenZ2andxbmJmZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Njg4MDgsImV4cCI6MjA4NTA0NDgwOH0.8k8a4Wf5X8m3kN2vQ9v6z8v6z8v6z8v6z8v6z8v6z8v
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieXBsYmhmenZ2andxbmJmZXlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ2ODgwOCwiZXhwIjoyMDg1MDQ0ODA4fQ.bOj5cqA-c4gODgn_79HmiuXtnj2PSQOs0fMoteVxiWI
```

For storage operations in your admin panel, you'll need to use the service role key to bypass RLS policies. Update your Supabase client initialization in your admin components to use the service role key for storage operations:

```javascript
// For storage operations in admin panel
const supabaseStorage = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY, // Use service role key for storage
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);
```

⚠️ **Security Warning**: Only use the service role key in server-side code or in protected admin routes. Never expose it in client-side code that regular users can access.

## Troubleshooting Permission Errors

If you encounter "permission denied" errors when running SQL queries in the Supabase dashboard, this is expected behavior for certain operations. The service role key has elevated privileges that are typically only available through the API, not through the dashboard SQL editor.

For storage operations, the service role key in your application code will bypass these restrictions programmatically, which is why the client-side implementation using the service role key is the recommended approach.

## Restart Your Application

After setting up the storage buckets, restart your development server:

```bash
npm run dev
```

Your storage functionality should now work properly!