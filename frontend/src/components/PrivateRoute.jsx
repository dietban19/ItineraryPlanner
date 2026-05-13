import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { user, userProfile, loading } = useAuth();

  // Still resolving Firebase Auth / Firestore profile
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-dvh">
        <span className="text-stone-400 text-sm">Loading…</span>
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but profile not yet completed
  if (!userProfile?.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
