/**
 * Shows stacked avatars and an animated typing dots bubble.
 * Renders nothing when no users are typing.
 *
 * @param {{ typingUsers: Array<{ uid: string, displayName: string, photoURL: string }> }} props
 */
export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers.length) return null;

  return (
    <div className="flex items-end gap-2 px-0 pb-1">
      {/* Stacked avatars — max 3 shown */}
      <div className="flex items-center shrink-0 self-end mb-1">
        {typingUsers.slice(0, 3).map((u, i) => (
          <div
            key={u.uid}
            className="w-7 h-7 rounded-full border-2 border-stone-50 overflow-hidden bg-stone-200 flex items-center justify-center"
            style={{
              marginLeft: i > 0 ? '-10px' : '0',
              zIndex: typingUsers.length - i,
              position: 'relative',
            }}
          >
            {u.photoURL ? (
              <img
                src={u.photoURL}
                alt={u.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[0.6rem] font-bold text-stone-500">
                {(u.displayName?.[0] ?? '?').toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Animated dots bubble */}
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '900ms' }}
          />
          <span
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: '180ms', animationDuration: '900ms' }}
          />
          <span
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: '360ms', animationDuration: '900ms' }}
          />
        </div>
      </div>
    </div>
  );
}
