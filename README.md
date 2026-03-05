# Femibot AI Assistant - Frontend

A modern, responsive chatbot frontend for the Femigrants RAG (Retrieval-Augmented Generation) system with file management capabilities.

## 🚀 Features

- **💬 Interactive Chat Interface**: Ask questions and get AI-powered responses based on your uploaded documents
- **📁 File Management**: Upload, view, search, and delete files from your knowledge base
- **📊 Statistics Dashboard**: Real-time analytics on your uploaded files
- **🔍 Smart Search**: Filter files by name and status
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:8000`

## 🏃 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### 4. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
Frontend/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   └── Navigation.tsx # Navigation bar
│   ├── context/          # React Context (State Management)
│   │   └── ChatContext.tsx
│   ├── pages/            # Page components
│   │   ├── ChatPage.tsx  # Chat interface
│   │   └── FilesPage.tsx # File management
│   ├── services/         # API integration
│   │   └── api.ts        # API service layer
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:8000`. Make sure the backend is running before using the application.

### Key Endpoints Used:

- `POST /chat` - Send messages and get AI responses
- `POST /files/upload` - Upload new files
- `GET /files` - List all files
- `DELETE /files/{file_id}` - Delete a file
- `POST /files/bulk-delete` - Delete multiple files
- `GET /files/statistics` - Get statistics

## 💡 Usage Guide

### Chat Page

1. Navigate to the **Chat** tab
2. Type your question in the input box
3. Press **Enter** or click **Send**
4. View AI responses with source documents
5. Use **Clear Chat** to start a new conversation

**Tips:**
- Press **Enter** to send, **Shift+Enter** for new line
- The AI uses the last 10 messages as context
- Sources show relevance scores for transparency

### Files Page

1. Navigate to the **Files** tab
2. Click **Choose File** or drag & drop to upload
3. View uploaded files in the grid
4. Use the search bar to find specific files
5. Filter by status (Available, Processing, Failed)
6. Select multiple files for bulk operations
7. Click **Delete** to remove files

**Features:**
- ✅ Real-time upload progress
- 📊 Statistics dashboard
- 🔍 Search and filter
- 🗑️ Bulk delete

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#667eea',    // Purple
      secondary: '#764ba2',  // Dark Purple
    },
  },
}
```

### API Base URL

Edit `src/services/api.ts` to change the backend URL:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 🐛 Troubleshooting

### Backend Connection Issues

**Error:** "Failed to load files. Please make sure the backend is running."

**Solution:**
1. Ensure backend is running on `http://localhost:8000`
2. Check CORS is enabled on backend
3. Verify network connectivity

### Upload Failures

**Error:** "Failed to upload file"

**Solution:**
1. Check file format (PDF, TXT, DOCX supported)
2. Verify file size is reasonable
3. Ensure backend has write permissions

### Chat Not Working

**Error:** "Sorry, there was an error processing your request"

**Solution:**
1. Upload at least one file to the knowledge base
2. Ensure backend is processing files (check status)
3. Verify backend API is responding

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Async/await for API calls

## 🔒 Security Notes

- No authentication implemented (add if needed)
- Backend should validate all inputs
- File uploads should be scanned
- Use HTTPS in production

## 📦 Deployment

### Option 1: Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option 2: Vercel

1. Import project
2. Framework: Vite
3. Deploy

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Femigrants platform.

## 🆘 Support

For issues or questions:
- Check the backend API documentation
- Review the specification file
- Verify all dependencies are installed

## 🎉 Acknowledgments

Built following the Femigrants Frontend Specification for integration with the RAG Backend.

---

**Happy Coding! 🚀**

