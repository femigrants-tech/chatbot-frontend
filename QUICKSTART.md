# Quick Start Guide

Get up and running with the Femibot AI Assistant in 3 simple steps!

## ⚡ Quick Setup

### Step 1: Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

The app is pre-configured to use **Gemini 2.5 Flash** AI model.

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including React, TypeScript, Tailwind CSS, and more.

### Step 3: Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Step 4: Use the Application

1. **Make sure the backend is running** on `http://localhost:8000`
   - Backend should be configured with Gemini 2.5 Flash API
2. Navigate to the **Files** tab
3. Upload some documents (PDF, TXT, DOCX)
4. Go to the **Chat** tab
5. Start asking questions about your documents!
   - Notice "Powered by gemini-2.5-flash" in the header

---

## 🎯 First Time Usage

### Upload Your First Document

1. Open **http://localhost:3000/files**
2. Click the file input or drag & drop a document
3. Wait for the upload to complete
4. Check the statistics dashboard for confirmation

### Ask Your First Question

1. Navigate to **http://localhost:3000/chat**
2. Type a question like: "What is this document about?"
3. Press **Enter** or click **Send**
4. View the AI response with source citations

---

## 🔧 Troubleshooting

### "Failed to load files" Error

**Problem:** Can't connect to the backend

**Solution:**
```bash
# In a separate terminal, make sure your backend is running
# The backend should be at http://localhost:8000

# Test the backend:
curl http://localhost:8000/files
```

### Port 3000 Already in Use

**Problem:** Another app is using port 3000

**Solution:** Edit `vite.config.ts` and change the port:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Change to any available port
  },
})
```

### Blank Page After npm run dev

**Problem:** Build error or missing dependencies

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

## 📁 What Was Built

Your complete frontend application includes:

✅ **Chat Interface** (`/chat`)
- Message input and display
- AI responses with source citations
- Conversation history
- Loading states
- Error handling

✅ **File Management** (`/files`)
- File upload with drag & drop
- File grid with search/filter
- Bulk delete functionality
- Statistics dashboard
- Status indicators

✅ **Navigation**
- Responsive navigation bar
- Route management
- Active page highlighting

✅ **API Integration**
- Complete API service layer
- All endpoints implemented
- Error handling
- Type safety with TypeScript

---

## 🎨 Key Features

### Chat Page Features
- ✅ Real-time AI responses
- ✅ Source document citations
- ✅ Conversation context (last 10 messages)
- ✅ Clear chat button
- ✅ Example questions
- ✅ Loading animations
- ✅ Enter to send, Shift+Enter for new line

### Files Page Features
- ✅ Drag & drop file upload
- ✅ Search by filename
- ✅ Filter by status (Available/Processing/Failed)
- ✅ Bulk select and delete
- ✅ Statistics dashboard
- ✅ File size and date display
- ✅ Processing progress bars
- ✅ Responsive grid layout

---

## 🚀 Next Steps

### Customize the App

1. **Change Colors**: Edit `tailwind.config.js`
2. **Add Features**: Extend components in `src/pages/` and `src/components/`
3. **Modify API**: Update `src/services/api.ts`

### Deploy to Production

```bash
# Build for production
npm run build

# The dist/ folder contains your production files
# Deploy to Netlify, Vercel, or any static hosting
```

### Add Authentication

If you need user authentication:
1. Add a login page
2. Store tokens in localStorage
3. Add auth headers to API requests in `src/services/api.ts`

---

## 📚 Project Structure Overview

```
src/
├── components/          # Reusable UI components
│   └── Navigation.tsx   # Top navigation bar
├── context/            # React Context for state
│   └── ChatContext.tsx # Chat state management
├── pages/              # Main page components
│   ├── ChatPage.tsx    # /chat route
│   └── FilesPage.tsx   # /files route
├── services/           # API integration
│   └── api.ts          # Backend API calls
├── types/              # TypeScript definitions
│   └── index.ts        # All type interfaces
├── App.tsx             # Main app with routing
├── main.tsx            # React entry point
└── index.css           # Global styles
```

---

## 🔑 Important Notes

### API Parameter Names

⚠️ **CRITICAL**: When sending chat messages, use `chat_context` (not `history` or `messages`):

```typescript
{
  message: "Your question",
  chat_context: [...previous messages]  // Must be named exactly this
}
```

### File Upload Format

Files must be uploaded as `multipart/form-data`:
- Field name: `file` (required)
- Metadata: `metadata` (optional JSON string)

### Supported File Types

- PDF (`.pdf`)
- Text (`.txt`)
- Word Documents (`.docx`, `.doc`)

---

## 💡 Tips & Best Practices

1. **Upload Multiple Documents**: More documents = better AI responses
2. **Clear Cache**: If seeing old data, clear browser cache
3. **Check Backend Logs**: For API errors, check backend console
4. **Use Search**: On files page, use search to find specific documents
5. **Monitor Processing**: Wait for files to show "Available" status before chatting

---

## 🆘 Common Questions

**Q: How many files can I upload?**
A: No hard limit, but performance depends on your backend configuration.

**Q: Can I delete chat history?**
A: Yes! Click the "Clear Chat" button in the header.

**Q: Where are files stored?**
A: Files are stored on the backend server, not in the browser.

**Q: Can I edit uploaded files?**
A: Currently no - delete and re-upload if needed.

**Q: Is there a file size limit?**
A: Depends on backend settings. Try to keep files under 50MB.

---

## ✅ Checklist

Before using the app, ensure:

- [ ] Node.js is installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] Backend is running on `http://localhost:8000`
- [ ] Development server started (`npm run dev`)
- [ ] Browser opened to `http://localhost:3000`
- [ ] At least one file uploaded
- [ ] File shows "Available" status

---

## 🎉 You're Ready!

Everything is set up and ready to go. Start uploading files and chatting with your AI assistant!

**Need Help?** Check:
- `README.md` - Full documentation
- `FRONTEND_SPECIFICATION.md` - Complete specification
- Backend API documentation

**Happy Chatting! 💬🚀**

