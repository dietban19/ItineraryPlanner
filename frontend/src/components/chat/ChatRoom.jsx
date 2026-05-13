import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToMessages,
  subscribeToChat,
  sendMessage,
  setTyping,
} from '../../services/chat.service';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

/** How long (ms) of inactivity before the typing indicator is cleared. */
const TYPING_IDLE_MS = 2000;

/** Treat a typing entry as stale if it hasn't refreshed within this window. */
const TYPING_STALE_MS = 5000;

/** How close to the bottom the user must be before we auto-scroll. */
const BOTTOM_THRESHOLD_PX = 96;

function getInitialViewport() {
  if (typeof window === 'undefined') {
    return {
      top: 0,
      height: 0,
    };
  }

  return {
    top: window.visualViewport?.offsetTop ?? 0,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}

function getMillis(value) {
  if (!value) return 0;

  if (value instanceof Date) {
    return value.getTime();
  }

  // Firestore Timestamp
  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  // Firestore Timestamp-like object
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }

  return 0;
}

/**
 * A self-contained, real-time chat room.
 *
 * @param {{
 *   chatId: string,
 *   title?: string,
 *   subtitle?: string,
 *   onBack?: () => void
 * }} props
 */
export default function ChatRoom({
  chatId,
  title,
  subtitle,
  onBack,
  standalone = false,
}) {
  const { user, userProfile } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chatDoc, setChatDoc] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [vp, setVp] = useState(getInitialViewport);

  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior = 'auto') => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior,
        block: 'end',
      });
    });
  }, []);

  const updateStickiness = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom < BOTTOM_THRESHOLD_PX;
  }, []);

  const clearTypingNow = useCallback(() => {
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;

    if (chatId && user?.uid) {
      setTyping(chatId, user.uid, {}, false);
    }
  }, [chatId, user?.uid]);

  const stopTypingSoon = useCallback(() => {
    clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;

      if (chatId && user?.uid) {
        setTyping(chatId, user.uid, {}, false);
      }
    }, TYPING_IDLE_MS);
  }, [chatId, user?.uid]);

  // ─── Realtime subscriptions ───────────────────────────────────────────────

  useEffect(() => {
    if (!chatId) return undefined;

    const unsub = subscribeToMessages(chatId, setMessages);
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return undefined;

    const unsub = subscribeToChat(chatId, setChatDoc);
    return unsub;
  }, [chatId]);

  // ─── Stop the page behind the chat from moving ────────────────────────────

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.width = previousBodyWidth;
    };
  }, []);

  // ─── Track visual viewport so the container pins to visible area ──────────
  // This helps with mobile Safari/Chrome keyboard behavior.

  useEffect(() => {
    const vv = window.visualViewport;

    const update = () => {
      setVp({
        top: vv?.offsetTop ?? 0,
        height: vv?.height ?? window.innerHeight,
      });
    };

    update();

    if (!vv) {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // ─── Auto-scroll to latest message only when already near bottom ──────────

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages, chatDoc?.typing, scrollToBottom]);

  // ─── Clean up typing indicator on unmount ─────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);

      if (isTypingRef.current && chatId && user?.uid) {
        setTyping(chatId, user.uid, {}, false);
      }
    };
  }, [chatId, user?.uid]);

  // ─── Typing users, excluding self and stale entries ───────────────────────

  const typingUsers = useMemo(() => {
    if (!chatDoc?.typing || !user) return [];

    const now = Date.now();

    return Object.entries(chatDoc.typing)
      .filter(([uid, val]) => {
        if (uid === user.uid) return false;

        const ts = getMillis(val.lastTyping);
        return now - ts < TYPING_STALE_MS;
      })
      .map(([uid, val]) => ({
        uid,
        ...val,
      }));
  }, [chatDoc, user]);

  // ─── Message grouping ─────────────────────────────────────────────────────

  const processedMessages = useMemo(() => {
    return messages.map((msg, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const isMe = msg.senderId === user?.uid;

      return {
        ...msg,
        isMe,
        // Show avatar on the last message in a consecutive group.
        showAvatar: !isMe && next?.senderId !== msg.senderId,
        // Show sender name on the first message in a consecutive group.
        showName: !isMe && prev?.senderId !== msg.senderId,
        isLastInGroup: next?.senderId !== msg.senderId,
      };
    });
  }, [messages, user?.uid]);

  // ─── Input handlers ───────────────────────────────────────────────────────

  const handleInput = useCallback(
    (e) => {
      setInput(e.target.value);

      if (!chatId || !user?.uid || !userProfile) return;

      if (!isTypingRef.current) {
        isTypingRef.current = true;

        setTyping(
          chatId,
          user.uid,
          {
            displayName: userProfile.displayName ?? user.email,
            photoURL: userProfile.photoURL ?? '',
          },
          true,
        );
      }

      stopTypingSoon();
    },
    [chatId, user, userProfile, stopTypingSoon],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();

    if (!text || !chatId || !user || sending) return;

    // After sending, behave like a native chat app: stay pinned to latest.
    shouldStickToBottomRef.current = true;

    // Keep keyboard open on mobile.
    inputRef.current?.focus({
      preventScroll: true,
    });

    clearTypingNow();
    setInput('');
    setSending(true);

    try {
      await sendMessage(chatId, {
        senderId: user.uid,
        senderName: userProfile?.displayName ?? user.email,
        senderPhotoURL: userProfile?.photoURL ?? '',
        text,
      });

      // Restore focus after the async send, because mobile browsers can blur.
      inputRef.current?.focus({
        preventScroll: true,
      });

      scrollToBottom('smooth');
    } finally {
      setSending(false);
    }
  }, [
    input,
    chatId,
    user,
    userProfile,
    sending,
    clearTypingNow,
    scrollToBottom,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInputFocus = useCallback(() => {
    // When keyboard opens, keep the latest messages visible.
    shouldStickToBottomRef.current = true;

    // Mobile keyboard resize is animated, so scroll more than once.
    setTimeout(() => scrollToBottom('smooth'), 50);
    setTimeout(() => scrollToBottom('smooth'), 300);
  }, [scrollToBottom]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={`flex flex-col bg-stone-50 font-display overscroll-none${standalone ? '' : ' h-full'}`}
      style={
        standalone
          ? {
              position: 'fixed',
              top: `${vp.top}px`,
              left: 0,
              right: 0,
              height: `${vp.height}px`,
              zIndex: 50,
              touchAction: 'none',
            }
          : undefined
      }
    >
      {/* Header */}
      {(onBack || title) && (
        <div className="shrink-0 bg-white border-b border-stone-100 flex items-center gap-3 px-4 py-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full active:bg-stone-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-stone-700" strokeWidth={2} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-semibold text-stone-800 text-sm truncate leading-tight">
                {title}
              </p>
            )}

            {subtitle && (
              <p className="text-[0.65rem] text-stone-400 truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Messages list */}
      <div
        ref={messagesRef}
        onScroll={updateStickiness}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-1.5"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
      >
        {messages.length === 0 && (
          <p className="text-center text-xs text-stone-400 mt-8 select-none">
            No messages yet. Say hello!
          </p>
        )}

        {processedMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.isMe}
            showAvatar={msg.showAvatar}
            showName={msg.showName}
            isLastInGroup={msg.isLastInGroup}
          />
        ))}

        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 bg-white border-t border-stone-100 px-3 py-3 flex items-center gap-2">
        <div className="flex-1 bg-stone-100 rounded-full flex items-center px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder="Message…"
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="on"
            className="flex-1 bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none"
          />
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            // Prevent the send button from stealing focus.
            // This keeps the mobile keyboard open after tapping send.
            e.preventDefault();
          }}
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all"
          aria-label="Send message"
        >
          <Send size={16} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
