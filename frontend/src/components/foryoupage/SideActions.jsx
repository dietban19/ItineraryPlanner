import ActionButton from './ActionButton';
import Avatar from './Avatar';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  MoreHorizontal,
} from 'lucide-react';

export default function SideActions({ itinerary }) {
  return (
    <aside className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-5">
      <Avatar src={itinerary.avatar} />
      <ActionButton icon={<Heart fill="white" />} label={itinerary.likes} />
      <ActionButton
        icon={<MessageCircle fill="white" />}
        label={itinerary.comments}
      />
      <ActionButton icon={<Bookmark fill="white" />} label={itinerary.saves} />
      <ActionButton icon={<Share fill="white" />} label={itinerary.shares} />
      <button aria-label="More options" className="text-white">
        <MoreHorizontal size={30} strokeWidth={3} />
      </button>
    </aside>
  );
}
