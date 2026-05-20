import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userId } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const filesHref = isAuthenticated ? '/files' : '/login';

  const handleLogout = () => {
    logout();
    navigate('/chat');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand Section */}
          <div className="flex items-center space-x-3 animate-slideIn">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text font-['Poppins']">
                Femibot
              </h1>
              <p className="text-xs text-gray-600 font-medium">AI Assistant</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link
              to="/chat"
              className={`relative inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                isActive('/chat')
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/50'
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
              }`}
            >
              {isActive('/chat') && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl blur-xl opacity-50"></div>
              )}
              <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="relative z-10">Chat</span>
              {isActive('/chat') && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
              )}
            </Link>
            
            <Link
              to={filesHref}
              state={!isAuthenticated ? { from: { pathname: '/files' } } : undefined}
              className={`relative inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                isActive('/files') || isActive('/login')
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/50'
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
              }`}
            >
              {(isActive('/files') || isActive('/login')) && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl blur-xl opacity-50"></div>
              )}
              <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="relative z-10">Files</span>
              {(isActive('/files') || isActive('/login')) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
              )}
            </Link>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white hover:shadow-md"
              >
                Sign out
              </button>
            )}
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-3 animate-slideIn">
            {isAuthenticated && userId && (
              <span className="hidden text-xs font-medium text-gray-600 sm:inline">
                {userId}
              </span>
            )}
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
