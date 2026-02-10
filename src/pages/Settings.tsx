import { useState } from 'react';
import { ManageBills } from '@/pages/ManageBills';
import { ManagePaydays } from '@/pages/ManagePaydays';
import { ManageAccounts } from '@/pages/ManageAccounts';

type Tab = 'bills' | 'paydays' | 'accounts';

const tabs: { key: Tab; label: string }[] = [
  { key: 'bills', label: 'Bills' },
  { key: 'paydays', label: 'Paydays' },
  { key: 'accounts', label: 'Accounts' },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('bills');

  return (
    <>
      <header className="border-b border-[var(--border-color)] pb-4 mb-4 md:pb-6 md:mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] hidden sm:block">Settings</h2>
        <p className="text-[var(--text-secondary)] hidden sm:block">
          Manage your bills, paydays, and accounts.
        </p>
      </header>

      <div className="flex gap-1 border-b border-[var(--border-color)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-emerald-400'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'bills' && <ManageBills />}
      {activeTab === 'paydays' && <ManagePaydays />}
      {activeTab === 'accounts' && <ManageAccounts />}
    </>
  );
}
