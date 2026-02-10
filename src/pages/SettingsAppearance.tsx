import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export const SettingsAppearance = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'light') return 'light';
    if (stored === 'dark') return 'dark';
    return 'system';
  });

  useEffect(() => {
    const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
      if (newTheme === 'system') {
        localStorage.removeItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        localStorage.setItem('darkMode', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
  }, [theme]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Appearance</h3>
        <p className="text-[var(--text-secondary)]">Customize how the app looks securely.</p>
      </div>

      <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6">
        <h4 className="text-lg font-medium text-[var(--text-primary)] mb-4">Theme Preference</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
              theme === 'light'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <Sun size={32} />
            <span className="font-medium">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <Moon size={32} />
            <span className="font-medium">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
              theme === 'system'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <Monitor size={32} />
            <span className="font-medium">System</span>
          </button>
        </div>
      </div>
    </div>
  );
};
