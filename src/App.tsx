import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="min-h-screen bg-primary-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/files" element={<FilesPage />} />
          </Routes>
        </div>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;

