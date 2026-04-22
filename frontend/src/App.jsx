import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bookmarks from './pages/Bookmarks';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Search from './pages/Search';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spin" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
};

const AppRoutes = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' },
        success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg3)' } },
        error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg3)' } },
      }}
    />
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><><Navbar /><Home /></></PrivateRoute>} />
      <Route path="/bookmarks" element={<PrivateRoute><><Navbar /><Bookmarks /></></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><><Navbar /><Notifications /></></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><><Navbar /><Profile /></></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><><Navbar /><Search /></></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
