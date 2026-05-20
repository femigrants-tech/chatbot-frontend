import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <div className="min-h-screen bg-primary-50">
            <Navigation />
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <FilesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
