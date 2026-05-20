import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, isAdminConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/files';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password) {
      setError('Please enter your admin ID and password.');
      return;
    }

    if (!isAdminConfigured) {
      setError('Admin login is not configured. Set VITE_ADMIN_USER_ID and VITE_ADMIN_PASSWORD.');
      return;
    }

    setSubmitting(true);
    try {
      const success = await login(userId, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid admin ID or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl border border-white/30 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="font-['Poppins'] text-2xl font-bold gradient-text">Admin sign in</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage the knowledge base files.
            </p>
          </div>

          {!isAdminConfigured && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Admin credentials are not set. Configure{' '}
              <code className="text-xs">VITE_ADMIN_USER_ID</code> and{' '}
              <code className="text-xs">VITE_ADMIN_PASSWORD</code> in your environment.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userId" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Admin ID
              </label>
              <input
                id="userId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter admin ID"
                disabled={submitting || !isAdminConfigured}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter password"
                disabled={submitting || !isAdminConfigured}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !isAdminConfigured}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition hover:from-primary-700 hover:to-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/chat" className="font-medium text-primary-600 hover:text-primary-700">
              ← Back to chat
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
