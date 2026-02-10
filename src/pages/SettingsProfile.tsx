import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail } from 'lucide-react';

export const SettingsProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    try {
      await updateUserProfile(displayName);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Profile Settings</h3>
        <p className="text-[var(--text-secondary)]">Manage your public profile information.</p>
      </div>

      <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-3xl font-bold border border-emerald-500/20">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div>
            <button className="text-sm bg-white/10 hover:bg-white/20 text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] transition-colors">
              Change Avatar
            </button>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <User size={18} />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-secondary)] cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Email cannot be changed securely yet.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              {successMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
