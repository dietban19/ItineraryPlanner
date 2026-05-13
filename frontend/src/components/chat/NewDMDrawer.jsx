import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { fetchUserProfile } from '../../services/chat.service';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';

/**
 * Bottom-sheet drawer for starting a new Direct Message.
 * Shows all people from the current user's shared trips as potential recipients.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelectUser: (profile: object) => void
 * }} props
 */
export default function NewDMDrawer({ open, onClose, onSelectUser }) {
  const { user } = useAuth();
  const { trips } = useTrips();
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch profiles of everyone on the user's trips (excluding themselves)
  useEffect(() => {
    if (!open || !user) {
      setProfiles([]);
      setSearch('');
      return;
    }

    const allMemberIds = new Set();
    trips.forEach((t) => t.memberIds?.forEach((id) => allMemberIds.add(id)));
    allMemberIds.delete(user.uid);

    if (!allMemberIds.size) {
      setProfiles([]);
      return;
    }

    setLoading(true);
    Promise.all([...allMemberIds].map(fetchUserProfile))
      .then((results) => setProfiles(results.filter(Boolean)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, trips, user]);

  const filtered = profiles.filter((p) =>
    p.displayName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <h2 className="font-semibold text-stone-800 text-base">
            New Message
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full active:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-stone-600" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 bg-stone-100 rounded-full px-4 py-2.5">
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none flex-1"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 160px)' }}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-10 px-6">
              {profiles.length === 0
                ? 'No contacts yet.\nJoin a trip to connect with other travellers.'
                : 'No results found.'}
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      onSelectUser(p);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-stone-50 transition-colors text-left"
                  >
                    {p.photoURL ? (
                      <img
                        src={p.photoURL}
                        alt={p.displayName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                        <span className="font-bold text-stone-500 text-sm">
                          {(p.displayName?.[0] ?? '?').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800 text-sm truncate">
                        {p.displayName}
                      </p>
                      <p className="text-xs text-stone-400 truncate">
                        {p.email}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
