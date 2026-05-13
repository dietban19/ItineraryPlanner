import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">
          Welcome back
        </p>
        <h1 className="text-base font-semibold text-stone-800 leading-tight">
          {user?.email?.split('@')[0] ?? 'Traveller'}
        </h1>
      </div>
      <button
        onClick={logout}
        className="text-sm text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-lg"
      >
        Sign out
      </button>
    </header>
  );
}
