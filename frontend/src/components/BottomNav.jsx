import { Home, MapIcon, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'Home', label: 'Home', Icon: Home, path: '/dashboard' },
  { key: 'MyTrips', label: 'My Trips', Icon: MapIcon, path: '/trips' },
  { key: 'DMs', label: 'DMs', Icon: MessageCircle, path: '/dms' },
  { key: 'Profile', label: 'Profile', Icon: User, path: '/profile' },
];

function NavBtn({ label, Icon, active = false, dark = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
        dark
          ? active
            ? 'text-white'
            : 'text-white/50'
          : active
            ? 'text-stone-800'
            : 'text-stone-400'
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export default function BottomNav({ active = 'Home', dark = false }) {
  const navigate = useNavigate();
  return (
    <nav
      className={`flex items-center justify-around px-4 py-3 pb-safe border-t ${dark ? 'bg-black border-white/10' : 'bg-white border-stone-100'}`}
    >
      {TABS.map(({ key, label, Icon, path }) => (
        <NavBtn
          key={key}
          label={label}
          Icon={Icon}
          active={active === key}
          dark={dark}
          onClick={() => navigate(path)}
        />
      ))}
    </nav>
  );
}
