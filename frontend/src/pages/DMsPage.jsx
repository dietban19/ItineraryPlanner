import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTrips } from '../context/TripContext';
import ChatConversationList from '../components/chat/ChatConversationList';
import ChatRoom from '../components/chat/ChatRoom';
import NewDMDrawer from '../components/chat/NewDMDrawer';

export default function DMsPage() {
  const { user, userProfile } = useAuth();
  const { chats, chatsLoading, memberProfiles, openDM } = useChat();
  const { trips } = useTrips();

  const [activeChat, setActiveChat] = useState(null);
  const [newDMOpen, setNewDMOpen] = useState(false);

  /** Derive a display title for the active chat. */
  function getChatTitle(chat) {
    if (!chat) return '';
    if (chat.type === 'trip') {
      const trip = trips?.find((t) => t._id === chat.tripId);
      return trip?.title ?? 'Trip Chat';
    }
    const otherId = chat.memberIds?.find((id) => id !== user?.uid);
    return memberProfiles[otherId]?.displayName ?? 'Direct Message';
  }

  function getChatSubtitle(chat) {
    if (chat?.type === 'trip') {
      const trip = trips?.find((t) => t._id === chat.tripId);
      return trip ? `${trip.destination} · Group chat` : 'Group chat';
    }
    return null;
  }

  /** Called when the user taps a person in the NewDM drawer. */
  async function handleSelectUser(profile) {
    if (!user) return;
    const chatId = await openDM(profile.id);
    setActiveChat({
      id: chatId,
      type: 'dm',
      memberIds: [user.uid, profile.id],
    });
  }

  // ── Open chat view ─────────────────────────────────────────────────────────
  if (activeChat) {
    return (
      <div className="h-full">
        <ChatRoom
          chatId={activeChat.id}
          title={getChatTitle(activeChat)}
          subtitle={getChatSubtitle(activeChat)}
          onBack={() => setActiveChat(null)}
          standalone
        />
      </div>
    );
  }

  // ── Conversation list view ─────────────────────────────────────────────────
  return (
    <>
      <ChatConversationList
        chats={chats}
        currentUserId={user?.uid}
        memberProfiles={memberProfiles}
        trips={trips}
        onSelectChat={setActiveChat}
        onNewDM={() => setNewDMOpen(true)}
      />
      <NewDMDrawer
        open={newDMOpen}
        onClose={() => setNewDMOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </>
  );
}
