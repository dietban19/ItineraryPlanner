import { useMemo } from 'react';

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function AvatarCircle({ name, photoURL }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0 self-end mb-1"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center shrink-0 self-end mb-1">
      <span className="text-[0.6rem] font-bold text-stone-500">
        {(name?.[0] ?? '?').toUpperCase()}
      </span>
    </div>
  );
}

/**
 * Renders a single chat message bubble.
 *
 * @param {{ message, isMe, showAvatar, showName, isLastInGroup }} props
 */
export default function MessageBubble({
  message,
  isMe,
  showAvatar,
  showName,
  isLastInGroup,
}) {
  const time = useMemo(
    () => formatTime(message.createdAt),
    [message.createdAt],
  );

  if (isMe) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-0.5 max-w-[75%]">
          <div className="bg-stone-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm leading-snug wrap-break-word">
              {message.text}
            </p>
          </div>
          {isLastInGroup && (
            <span className="text-[0.6rem] text-stone-400 px-1">{time}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      {showAvatar ? (
        <AvatarCircle
          name={message.senderName}
          photoURL={message.senderPhotoURL}
        />
      ) : (
        /* Spacer so bubble aligns correctly in grouped messages */
        <div className="w-7 shrink-0" />
      )}
      <div className="flex flex-col gap-0.5 max-w-[75%]">
        {showName && (
          <span className="text-[0.65rem] font-semibold text-stone-400 px-1">
            {message.senderName}
          </span>
        )}
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-snug text-stone-800 wrap-break-word">
            {message.text}
          </p>
        </div>
        {isLastInGroup && (
          <span className="text-[0.6rem] text-stone-400 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}
