import React, { Suspense, lazy, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Create an authentication context to manage auth state globally
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Lazy load page components
const Login = lazy(() => import('./pages/login'));
const Signup = lazy(() => import('./pages/signup'));
const Chat = lazy(() => import('./pages/chat'));

// ProtectedRoute component to guard authenticated routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ErrorBoundary to catch errors during lazy loading or rendering
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center text-white bg-gray-900">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  // Simulated authentication state; replace with real logic when ready.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authValue = {
    isAuthenticated,
    login: () => setIsAuthenticated(true),
    logout: () => setIsAuthenticated(false),
  };

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center text-white bg-gray-900">
              Loading...
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login onLogin={authValue.login} />} />
              <Route path="/signup" element={<Signup onSignup={authValue.login} />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;