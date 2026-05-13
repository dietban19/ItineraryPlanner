import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const PATH_TO_TAB = {
  '/dashboard': 'Home',
  '/trips': 'MyTrips',
  '/dms': 'DMs',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const activeTab = PATH_TO_TAB[pathname] ?? 'Home';
  const isDark = pathname === '/dashboard';

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 overflow-auto flex flex-col min-h-0">
        <Outlet />
      </div>
      <BottomNav active={activeTab} dark={isDark} />
    </div>
  );
}
