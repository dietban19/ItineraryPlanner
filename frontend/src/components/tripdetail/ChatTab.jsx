import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrCreateTripChat } from '../../services/chat.service';
import ChatRoom from '../chat/ChatRoom';

/**
 * Trip chat tab. Lazy-creates the Firestore chat room for this trip on first open,
 * then renders the shared ChatRoom component (same room that appears in DMs).
 *
 * @param {{ trip: object }} props
 */
export default function ChatTab({ trip }) {
  const { user } = useAuth();
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!trip?._id || !user?.uid) return;
    setLoading(true);
    setError(false);
    getOrCreateTripChat(trip._id, user.uid)
      .then(setChatId)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [trip?._id, user?.uid]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chatId) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-stone-400 text-center">
          Could not load chat. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return <ChatRoom chatId={chatId} />;
}
