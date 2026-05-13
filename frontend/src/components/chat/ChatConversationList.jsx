import { useMemo } from 'react';
import { MessageCircle, Plus } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

function SingleAvatar({ profile }) {
  if (profile?.photoURL) {
    return (
      <img
        src={profile.photoURL}
        alt={profile.displayName}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
      <span className="text-base font-bold text-stone-500">
        {(profile?.displayName?.[0] ?? '?').toUpperCase()}
      </span>
    </div>
  );
}

function StackedAvatars({ profiles }) {
  const shown = profiles.slice(0, 2);
  return (
    <div className="relative w-12 h-12 shrink-0">
      {shown.map((p, i) =>
        p?.photoURL ? (
          <img
            key={p.id ?? i}
            src={p.photoURL}
            alt={p.displayName}
            className="absolute w-8 h-8 rounded-full object-cover border-2 border-white"
            style={{
              top: i === 0 ? 0 : 'auto',
              bottom: i === 1 ? 0 : 'auto',
              left: i === 0 ? 0 : 'auto',
              right: i === 1 ? 0 : 'auto',
            }}
          />
        ) : (
          <div
            key={p?.id ?? i}
            className="absolute w-8 h-8 rounded-full bg-stone-300 border-2 border-white flex items-center justify-center"
            style={{
              top: i === 0 ? 0 : 'auto',
              bottom: i === 1 ? 0 : 'auto',
              left: i === 0 ? 0 : 'auto',
              right: i === 1 ? 0 : 'auto',
            }}
          >
            <span className="text-[0.6rem] font-bold text-stone-500">
              {(p?.displayName?.[0] ?? '?').toUpperCase()}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

function TripGroupAvatar() {
  return (
    <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
      <span className="text-xl">✈️</span>
    </div>
  );
}

// ─── ChatConversationList ─────────────────────────────────────────────────────

/**
 * Renders the list of all conversations for the DMs page.
 *
 * @param {{
 *   chats: object[],
 *   currentUserId: string,
 *   memberProfiles: Record<string, object>,
 *   trips: object[],
 *   onSelectChat: (chat: object) => void,
 *   onNewDM: () => void
 * }} props
 */
export default function ChatConversationList({
  chats,
  currentUserId,
  memberProfiles,
  trips,
  onSelectChat,
  onNewDM,
}) {
  const sortedChats = useMemo(
    () =>
      [...chats].sort((a, b) => {
        const at = a.lastMessage?.timestamp ?? a.updatedAt ?? '';
        const bt = b.lastMessage?.timestamp ?? b.updatedAt ?? '';
        return bt.localeCompare(at);
      }),
    [chats],
  );

  function getChatLabel(chat) {
    if (chat.type === 'trip') {
      const trip = trips?.find((t) => t._id === chat.tripId);
      return trip?.title ?? 'Trip Chat';
    }
    const otherId = chat.memberIds?.find((id) => id !== currentUserId);
    return memberProfiles[otherId]?.displayName ?? 'Direct Message';
  }

  function getChatSubtitle(chat) {
    if (!chat.lastMessage) return 'No messages yet';
    const isMe = chat.lastMessage.senderId === currentUserId;
    const preview =
      chat.lastMessage.text.length > 45
        ? `${chat.lastMessage.text.slice(0, 45)}…`
        : chat.lastMessage.text;
    return isMe ? `You: ${preview}` : preview;
  }

  function getChatAvatar(chat) {
    if (chat.type === 'trip') {
      return <TripGroupAvatar />;
    }
    const otherIds = chat.memberIds?.filter((id) => id !== currentUserId) ?? [];
    if (otherIds.length === 1) {
      return <SingleAvatar profile={memberProfiles[otherIds[0]]} />;
    }
    return (
      <StackedAvatars profiles={otherIds.map((id) => memberProfiles[id])} />
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50 font-display">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white border-b border-stone-100 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">Messages</h1>
        <button
          onClick={onNewDM}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center active:bg-stone-200 transition-colors"
          aria-label="New message"
        >
          <Plus size={18} className="text-stone-700" strokeWidth={2} />
        </button>
      </header>

      {sortedChats.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
          <MessageCircle
            size={48}
            className="text-stone-300"
            strokeWidth={1.5}
          />
          <p className="text-stone-400 text-sm">No messages yet.</p>
          <button
            onClick={onNewDM}
            className="mt-1 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-full active:opacity-80 transition-opacity"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto divide-y divide-stone-100 bg-white">
          {sortedChats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat)}
                className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-stone-50 transition-colors text-left"
              >
                {getChatAvatar(chat)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-stone-800 text-sm truncate">
                      {getChatLabel(chat)}
                    </p>
                    <span className="text-[0.65rem] text-stone-400 shrink-0">
                      {formatTimestamp(
                        chat.lastMessage?.timestamp ?? chat.updatedAt,
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate mt-0.5">
                    {chat.type === 'trip' && (
                      <span className="text-stone-300 mr-1">✈️</span>
                    )}
                    {getChatSubtitle(chat)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
