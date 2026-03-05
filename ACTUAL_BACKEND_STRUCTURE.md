# Actual Backend Structure - View Documents Feature

## ✅ Issue Resolved!

Your backend **IS** returning signed URLs! They were just nested in a different location than expected.

## Actual Response Structure

Your backend's `/chat` endpoint returns this structure:

```json
{
  "response": "The Femigrant Foundation was founded in 1980 by Kunal Tajne...",
  "context_used": [
    {
      "text": "The Founding of the Femigrant Foundation...",
      "score": 0.9287263,
      "metadata": {
        "file_id": "215d62a4-a92e-4c86-9bdb-731d8003204d",
        "file_name": "upload-1759814300776-The Founding of the Femigrant Foundation.pdf",
        "pages": [1],
        "type": "pdf"
      },
      "reference": {
        "file": {
          "id": "215d62a4-a92e-4c86-9bdb-731d8003204d",
          "name": "upload-1759814300776-The Founding of the Femigrant Foundation.pdf",
          "status": "Available",
          "size": 126307,
          "percent_done": 1,
          "created_on": "2025-10-07T05:18:21.129698209Z",
          "updated_on": "2025-10-07T05:18:40.090164576Z",
          "signed_url": "https://storage.googleapis.com/knowledge-prod-files/..." ← HERE!
        }
      }
    }
  ]
}
```

## Signed URL Location

The signed URL is at the **top level** of the context object:
```
context.reference.file.signed_url
```

**NOT** inside metadata!

## Frontend Updates Made

The frontend now checks for signed URLs in **all possible locations**:

1. ✅ `context.signed_url` (top level)
2. ✅ `context.metadata.signed_url` (in metadata)
3. ✅ `context.reference.file.signed_url` ← **YOUR STRUCTURE** (top level reference)
4. ✅ `context.metadata.reference.file.signed_url` (fallback)

This ensures compatibility with different backend implementations!

## How It Works Now

```javascript
// The viewDocument function checks multiple locations:
const signedUrl = 
  context.signed_url ||                          // Option 1
  context.metadata?.signed_url ||                // Option 2
  context.reference?.file?.signed_url ||         // Option 3 - YOUR BACKEND ✅
  context.metadata?.reference?.file?.signed_url; // Option 4 - Fallback

if (signedUrl) {
  window.open(signedUrl, '_blank'); // Opens the PDF!
}
```

## Testing

1. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Reload the page**
3. **Ask a question** in the chat
4. **Click "View Details"** - The PDF should now open! 🎉

## What You See in Console

When you click "View Details", you'll see:
```
Context item: { text: "...", score: 0.92, metadata: {...} }
Found signed URL, opening document: https://storage.googleapis.com/...
```

Then the PDF opens in a new tab!

## No Backend Changes Needed!

Your backend is **already perfect** - it includes signed URLs in the response. The frontend has been updated to find them at the nested location.

## Files Updated

1. ✅ `src/types/index.ts` - Added `reference.file` structure to ContextItem
2. ✅ `src/pages/ChatPage.tsx` - Updated to check nested signed_url location
3. ✅ `src/services/api.ts` - Already has getViewUrl as fallback

## Summary

- ✅ Backend is working correctly
- ✅ Frontend now finds the signed URL
- ✅ View Details button should work!
- ✅ No backend changes needed!

Try it now! 🚀

