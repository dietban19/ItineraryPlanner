import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-full bg-stone-50">
      <header className="px-5 pt-12 pb-4 bg-white border-b border-stone-100">
        <h1 className="text-xl font-semibold text-stone-800">Profile</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
        <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center">
          <User size={36} className="text-stone-400" strokeWidth={1.5} />
        </div>
        <p className="text-stone-400 text-sm">Sign in to view your profile.</p>
      </main>
    </div>
  );
}
