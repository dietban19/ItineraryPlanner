import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToUserChats,
  getOrCreateDMChat,
  fetchUserProfile,
} from '../services/chat.service';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  // Map of uid → profile object for every chat member we've fetched
  const [memberProfiles, setMemberProfiles] = useState({});
  const fetchedUids = useRef(new Set());

  // ─── Subscribe to user's chats ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setChats([]);
      setChatsLoading(false);
      return;
    }

    setChatsLoading(true);
    const unsub = subscribeToUserChats(user.uid, (newChats) => {
      setChats(newChats);
      setChatsLoading(false);
    });

    return unsub;
  }, [user]);

  // ─── Fetch profiles for any new members ───────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const allUids = new Set();
    chats.forEach((c) => c.memberIds?.forEach((uid) => allUids.add(uid)));

    const toFetch = [...allUids].filter(
      (uid) => uid !== user.uid && !fetchedUids.current.has(uid),
    );

    if (!toFetch.length) return;

    toFetch.forEach((uid) => fetchedUids.current.add(uid));

    Promise.all(toFetch.map(fetchUserProfile)).then((profiles) => {
      const map = {};
      profiles.forEach((p) => {
        if (p) map[p.id] = p;
      });
      setMemberProfiles((prev) => ({ ...prev, ...map }));
    });
  }, [chats, user]);

  // ─── Open / create a DM with another user ─────────────────────────────────
  const openDM = useCallback(
    async (otherUserId) => {
      if (!user) return null;
      return getOrCreateDMChat(user.uid, otherUserId);
    },
    [user],
  );

  return (
    <ChatContext.Provider
      value={{ chats, chatsLoading, memberProfiles, openDM }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}
