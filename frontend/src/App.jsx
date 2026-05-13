import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TripsProvider } from './context/TripContext';
import { ChatProvider } from './context/ChatContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ForYouPage from './pages/ForYouPage';
import MyTripsPage from './pages/MyTripsPage';
import DMsPage from './pages/DMsPage';
import ProfilePage from './pages/ProfilePage';
import TripDetailPage from './pages/TripDetailPage';

export default function App() {
  const [viewHeight, setViewHeight] = useState('100dvh');
  useEffect(() => {
    // 1. Fix Pinch-to-Zoom (Safari workaround)
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchstart', preventZoom, { passive: false });

    // 2. Handle Keyboard Resize using Visual Viewport
    const handleResize = () => {
      if (window.visualViewport) {
        setViewHeight(`${window.visualViewport.height}px`);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <AuthProvider>
      <TripsProvider>
        <ChatProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/complete-profile"
                element={<CompleteProfilePage />}
              />

              {/* Protected routes — require auth + completed profile */}
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<ForYouPage />} />
                  <Route path="/trips" element={<MyTripsPage />} />
                  <Route path="/dms" element={<DMsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="/trips/:id" element={<TripDetailPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </TripsProvider>
    </AuthProvider>
  );
}
